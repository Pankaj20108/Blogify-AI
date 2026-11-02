import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 150 },
        subTitle: { type: String, trim: true, maxlength: 250 },
        description: { type: String, required: true },
        category: { type: String, required: true },
        image: { type: String, required: true },
        isPublished: { type: Boolean, default: true },
        // SHA-256 hash of the owner key given to the publisher's browser (never returned by queries)
        ownerKeyHash: { type: String, select: false },
    },
    { timestamps: true }
);

const Blog = mongoose.model("blog", blogSchema);

export default Blog;
