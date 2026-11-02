import fs from "fs/promises";
import crypto from "crypto";
import Blog from "../models/Blog.js";
import { v2 as cloudinary } from "cloudinary";
import generateBlog from "../configs/gemini.js";
import { BLOG_CATEGORIES, LIMITS, cleanText, cleanRichText, isEmptyRichText, isValidId } from "../utils/sanitize.js";

const hashKey = (key) => crypto.createHash("sha256").update(String(key)).digest("hex");

// Parse, sanitize and validate the "blog" JSON field. Returns { blog } or { error }
const parseBlogInput = (raw) => {
    let blogData;
    try {
        blogData = JSON.parse(raw || "{}");
    } catch {
        return { error: "Invalid blog data" };
    }

    const blog = {
        title: cleanText(blogData.title),
        subTitle: cleanText(blogData.subTitle),
        description: cleanRichText(blogData.description),
        category: cleanText(blogData.category),
    };

    if (!blog.title || isEmptyRichText(blog.description) || !blog.category) return { error: "Title, description and category are required" };
    if (blog.title.length > LIMITS.title) return { error: `Title must be under ${LIMITS.title} characters` };
    if (blog.subTitle.length > LIMITS.subTitle) return { error: `Subtitle must be under ${LIMITS.subTitle} characters` };
    if (blog.description.length > LIMITS.description) return { error: "Description is too long" };
    if (!BLOG_CATEGORIES.includes(blog.category)) return { error: "Invalid category" };

    return { blog };
};

const uploadImage = async (imageFile) => {
    const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
        folder: "blogs",
        resource_type: "image",
    });
    return uploadResult.secure_url;
};

// Find a blog only if the request carries its owner key (x-owner-key header)
const findOwnedBlog = async (req, res) => {
    const { blogId } = req.params;
    const ownerKey = req.headers["x-owner-key"];

    if (!isValidId(blogId)) {
        res.status(400).json({ success: false, message: "Invalid blog id" });
        return null;
    }
    if (!ownerKey) {
        res.status(403).json({ success: false, message: "Only the publisher of this blog can change it" });
        return null;
    }

    const blog = await Blog.findById(blogId).select("+ownerKeyHash");
    if (!blog) {
        res.status(404).json({ success: false, message: "Blog not found" });
        return null;
    }
    if (!blog.ownerKeyHash || blog.ownerKeyHash !== hashKey(ownerKey)) {
        res.status(403).json({ success: false, message: "Only the publisher of this blog can change it" });
        return null;
    }
    return blog;
};

// Add Blog ( Public Route )
// POST /api/blog/add
export const addBlog = async (req, res) => {
    const imageFile = req.file;
    try {
        const { blog, error } = parseBlogInput(req.body.blog);
        if (error) return res.status(400).json({ success: false, message: error });
        if (!imageFile) return res.status(400).json({ success: false, message: "Thumbnail image is required" });

        const image = await uploadImage(imageFile);

        // The owner key is returned once; only its hash is stored
        const ownerKey = crypto.randomBytes(24).toString("hex");

        const created = await Blog.create({ ...blog, image, isPublished: true, ownerKeyHash: hashKey(ownerKey) });

        res.json({ success: true, message: "Blog published successfully", blogId: created._id, ownerKey });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    } finally {
        // Remove the temp file multer wrote to disk
        if (imageFile?.path) fs.unlink(imageFile.path).catch(() => {});
    }
};

// Update Blog ( Owner Key Required )
// PUT /api/blog/update/:blogId
export const updateBlog = async (req, res) => {
    const imageFile = req.file;
    try {
        const existing = await findOwnedBlog(req, res);
        if (!existing) return;

        const { blog, error } = parseBlogInput(req.body.blog);
        if (error) return res.status(400).json({ success: false, message: error });

        Object.assign(existing, blog);
        // Thumbnail is optional when editing - keep the old one if none was uploaded
        if (imageFile) existing.image = await uploadImage(imageFile);

        await existing.save();
        res.json({ success: true, message: "Blog updated successfully", blogId: existing._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (imageFile?.path) fs.unlink(imageFile.path).catch(() => {});
    }
};

// Delete Blog ( Owner Key Required )
// DELETE /api/blog/delete/:blogId
export const deleteBlog = async (req, res) => {
    try {
        const existing = await findOwnedBlog(req, res);
        if (!existing) return;

        await existing.deleteOne();
        res.json({ success: true, message: "Blog deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Generate Blog Content with Gemini AI ( Public Route )
// POST /api/blog/generate
export const generateContent = async (req, res) => {
    try {
        const prompt = cleanText(req.body?.prompt);
        const category = cleanText(req.body?.category);

        if (prompt.length < 3) {
            return res.status(400).json({ success: false, message: "Enter a topic of at least 3 characters" });
        }
        if (prompt.length > LIMITS.prompt) {
            return res.status(400).json({ success: false, message: `Topic must be under ${LIMITS.prompt} characters` });
        }

        const result = await generateBlog(prompt, BLOG_CATEGORIES.includes(category) ? category : "");

        res.json({
            success: true,
            content: {
                title: cleanText(result.title).slice(0, LIMITS.title),
                subTitle: cleanText(result.subTitle).slice(0, LIMITS.subTitle),
                description: cleanRichText(result.description),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "AI generation failed: " + error.message });
    }
};

// Get All Published Blogs ( Public Route )
// GET /api/blog/all
export const getAllPublishedBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 });
        res.json({ success: true, blogs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Published Blog By Id ( Public Route )
// GET /api/blog/published/:blogId
export const getPublishedBlogById = async (req, res) => {
    try {
        const { blogId } = req.params;
        if (!isValidId(blogId)) {
            return res.status(400).json({ success: false, message: "Invalid blog id" });
        }
        const blog = await Blog.findOne({ _id: blogId, isPublished: true });
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        res.json({ success: true, blog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
