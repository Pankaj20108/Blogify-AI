import multer from "multer";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const upload = multer({
    storage: multer.diskStorage({}),
    limits: { fileSize: 4 * 1024 * 1024, files: 1 }, // 4 MB (Vercel caps request bodies at 4.5 MB)
    fileFilter: (req, file, cb) => {
        if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
        cb(new Error("Only JPG, PNG, WEBP or GIF images are allowed"));
    },
});

export default upload;
