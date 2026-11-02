import sanitizeHtml from "sanitize-html";
import mongoose from "mongoose";

// Categories accepted by the API (must match blogCategories on the client, minus "All")
export const BLOG_CATEGORIES = ["Technology", "Startup", "Lifestyle", "Finance"];

export const LIMITS = {
    title: 150,
    subTitle: 250,
    description: 50000,
    prompt: 500,
};

// Strip every HTML tag - used for plain text fields (title, subtitle, prompt)
export const cleanText = (value) => {
    if (typeof value !== "string") return "";
    return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
};

// Allow only the formatting the Quill editor produces
export const cleanRichText = (value) => {
    if (typeof value !== "string") return "";
    return sanitizeHtml(value, {
        allowedTags: ["p", "br", "h1", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "blockquote", "pre", "code", "ol", "ul", "li", "a", "span"],
        allowedAttributes: {
            a: ["href", "target", "rel"],
            "*": ["class"],
            li: ["data-list"],
        },
        allowedClasses: { "*": ["ql-*"] },
        allowedSchemes: ["http", "https", "mailto"],
        transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }) },
    }).trim();
};

// True when the rich text has no visible text (e.g. Quill's empty "<p><br></p>")
export const isEmptyRichText = (html) => cleanText(html).length === 0;

export const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
