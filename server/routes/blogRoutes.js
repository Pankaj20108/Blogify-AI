import express from "express";
import upload from "../middleware/multer.js";
import { publishLimiter, editLimiter, aiLimiter } from "../middleware/rateLimit.js";
import { addBlog, updateBlog, deleteBlog, generateContent, getAllPublishedBlogs, getPublishedBlogById } from "../controllers/blogController.js";

const blogRouter = express.Router();

blogRouter.post("/add", publishLimiter, upload.single("image"), addBlog);
blogRouter.put("/update/:blogId", editLimiter, upload.single("image"), updateBlog);
blogRouter.delete("/delete/:blogId", editLimiter, deleteBlog);
blogRouter.post("/generate", aiLimiter, generateContent);
blogRouter.get("/all", getAllPublishedBlogs);
blogRouter.get("/published/:blogId", getPublishedBlogById);

export default blogRouter;
