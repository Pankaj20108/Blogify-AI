import { GoogleGenAI } from "@google/genai";

let client = null;

// Lazily create the client so the server still starts without a key
const getClient = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set on the server");
    }
    if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return client;
};

// Ask Gemini for a blog as JSON: { title, subTitle, description }
const generateBlog = async (prompt, category) => {
    const ai = getClient();

    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
        contents: `Write an engaging, original blog post about: "${prompt}".
Category: ${category || "General"}.
Return:
- "title": a catchy title (max 100 characters)
- "subTitle": a one-sentence subtitle (max 200 characters)
- "description": the full blog body (500-800 words) as simple HTML using only <h2>, <h3>, <p>, <strong>, <em>, <ul>, <ol>, <li> and <blockquote>. No <html>, <body>, images, scripts or markdown.`,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    subTitle: { type: "string" },
                    description: { type: "string" },
                },
                required: ["title", "subTitle", "description"],
            },
        },
    });

    return JSON.parse(response.text);
};

export default generateBlog;
