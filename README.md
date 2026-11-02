<<<<<<< HEAD
# Blogify AI

A simple full-stack blogging app (college demo). Anyone can write a blog, let **Gemini AI** draft the title, subtitle and description, edit it, and publish it. No login required.

**Stack:** React + Vite + Tailwind + Quill + Axios (client) · Express + MongoDB (Mongoose) + Cloudinary + Gemini (server)

## Features

- Public homepage listing all published blogs (search + category filter)
- **Publish Blog** button in the navbar opens the Add Blog page
- Add Blog form: thumbnail upload, title, subtitle, Quill description editor, category, Publish button
- **Generate with AI**: enter a topic and Gemini fills title, subtitle and description; everything stays editable before publishing
- Blog page to read the full post
- **Edit / Delete** your own blogs: the browser that published a blog gets a secret owner key, so only it sees the Edit and Delete buttons
- Light / dark theme toggle and 10 built-in sample blogs
- Abuse protection: rate limiting, input validation, HTML sanitization, image type/size checks

## Project structure

```
Blogify-FullStack/
├── client/                     React frontend
│   └── src/
│       ├── App.jsx             Routes: /, /blog/:id, /add-blog
│       ├── context/AppContext.jsx  Axios setup + blogs state
│       ├── components/         Navbar, Header, BlogList, BlogCard, Footer, ...
│       └── pages/              Home, Blog, author/AddBlog
└── server/                     Express API
    ├── server.js
    ├── configs/                db.js, cloudinary.js, gemini.js
    ├── controllers/blogController.js
    ├── middleware/             multer.js (uploads), rateLimit.js
    ├── models/Blog.js
    ├── routes/blogRoutes.js
    └── utils/sanitize.js       validation + sanitization helpers
```

## Setup

### 1. Prerequisites

- Node.js 18+
- A MongoDB database (free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works)
- A [Cloudinary](https://cloudinary.com) account (free tier)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### 2. Server

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and fill in the values:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/blogify
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.8-flash
```

Start it:

```bash
npm run server      # with nodemon (auto-restart)
# or
npm start
```

You should see `Database Connected` and `Server is running on port 3000`.

### 3. Client

```bash
cd client
npm install
```

`client/.env`:

```env
VITE_BASE_URL=http://localhost:3000
```

Start it:

```bash
npm run dev
```

Open http://localhost:5173.

## Demo flow

1. Open the homepage (no login needed).
2. Click **Publish Blog** in the navbar.
3. Upload a thumbnail and pick a category.
4. Type a topic in **Generate with AI** and click the button. Title, subtitle and description get filled in.
5. Edit anything you like.
6. Click **Publish**. You land on the new blog page, and it shows up on the homepage.

## API

| Method | Route                          | Description                                  | Rate limit      |
|--------|--------------------------------|----------------------------------------------|-----------------|
| GET    | `/api/blog/all`                | All published blogs (newest first)           | 300 / 15 min    |
| GET    | `/api/blog/published/:blogId`  | One published blog                           | 300 / 15 min    |
| POST   | `/api/blog/generate`           | `{ prompt, category }` → AI title/subtitle/description | 10 / 10 min |
| POST   | `/api/blog/add`                | multipart: `blog` (JSON string) + `image`; returns `ownerKey` | 10 / hour |
| PUT    | `/api/blog/update/:blogId`     | multipart like add (image optional); header `x-owner-key` | 30 / hour |
| DELETE | `/api/blog/delete/:blogId`     | header `x-owner-key`                          | 30 / hour       |

Limits are per IP and can be changed in `server/middleware/rateLimit.js`.

## Security notes

- **Validation:** required fields, max lengths (title 150, subtitle 250, topic 500), category whitelist, valid MongoDB ids.
- **Sanitization:** title/subtitle/topic are stripped of all HTML; descriptions keep only Quill formatting tags (no scripts, event handlers, images or `javascript:` links). AI output is sanitized the same way.
- **Uploads:** JPG/PNG/WEBP/GIF only, max 4 MB (Vercel request limit); temp files are deleted after the Cloudinary upload.
- Publishing is intentionally public (no accounts). Each new blog gets a random owner key that is returned once and saved in the publisher's browser (localStorage); the database stores only its SHA-256 hash. Edit and delete require that key. If browser data is cleared, the key is lost and the blog can only be removed from MongoDB Atlas.
=======
# Blogify-AI
>>>>>>> 3481b90060efed1a3f87ec7f4ea44fc7b9a2532a
