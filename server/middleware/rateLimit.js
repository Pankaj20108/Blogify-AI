import rateLimit from "express-rate-limit";

const limiter = (windowMinutes, limit, message) =>
    rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        limit,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        message: { success: false, message },
    });

// Applied to every /api request
export const apiLimiter = limiter(15, 300, "Too many requests, please try again later");

// Publishing a blog (image upload + DB write)
export const publishLimiter = limiter(60, 10, "Publish limit reached, please try again in an hour");

// Gemini AI generation (costs API quota)
export const aiLimiter = limiter(10, 10, "AI generation limit reached, please wait a few minutes");


// Editing or deleting your own blogs
export const editLimiter = limiter(60, 30, "Too many edits, please try again later");
