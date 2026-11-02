import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import connectDB from "./configs/db.js";
import blogRouter from "./routes/blogRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import { apiLimiter } from "./middleware/rateLimit.js";

const app = express();

await connectDB();
connectCloudinary();

// Middlewares
app.set("trust proxy", 1); // correct client IPs for rate limiting behind Vercel / proxies
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "1mb" }));

// Routes
app.get("/", (req, res) => res.send("API is Working"));
app.use("/api", apiLimiter);
app.use("/api/blog", blogRouter);

// Error handler (multer upload errors, bad JSON, etc.)
app.use((err, req, res, next) => {
    const message = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE" ? "Image must be under 4 MB" : err.message || "Something went wrong";
    res.status(err.status || 400).json({ success: false, message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});

export default app;
