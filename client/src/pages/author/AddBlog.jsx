import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { assets, blogCategories } from "../../assets/assets";
import Quill from "quill";
import { useAppContext, getErrorMessage, getOwnerKey, saveOwnerKey } from "../../context/AppContext";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";

// "All" is only a homepage filter, not a real category
const categories = blogCategories.filter((item) => item !== "All");

// Used for both publishing (/add-blog) and editing (/edit-blog/:id)
const AddBlog = () => {
    const { id } = useParams();
    const isEditing = Boolean(id);

    const { axios, fetchBlogs, navigate } = useAppContext();
    const [isAdding, setIsAdding] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const editorRef = useRef(null);
    const quillRef = useRef(null);

    const [image, setImage] = useState(false);
    const [existingImage, setExistingImage] = useState("");
    const [prompt, setPrompt] = useState("");
    const [title, setTitle] = useState("");
    const [subTitle, setSubTitle] = useState("");
    const [category, setCategory] = useState("Startup");

    // Fill title, subtitle and description with Gemini output - everything stays editable
    const generateContent = async () => {
        const topic = prompt.trim() || title.trim();
        if (topic.length < 3) {
            return toast.error("Enter a topic for the AI first");
        }
        try {
            setIsGenerating(true);
            const { data } = await axios.post("/api/blog/generate", { prompt: topic, category });
            if (data.success) {
                setTitle(data.content.title);
                setSubTitle(data.content.subTitle);
                quillRef.current.setText("");
                quillRef.current.clipboard.dangerouslyPasteHTML(data.content.description);
                toast.success("Content generated - review and edit before publishing");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsGenerating(false);
        }
    };

    // Load the blog into the form when editing
    const loadBlog = async () => {
        if (!getOwnerKey(id)) {
            toast.error("You can only edit blogs published from this browser");
            return navigate(`/blog/${id}`);
        }
        try {
            const { data } = await axios.get(`/api/blog/published/${id}`);
            if (!data.success) {
                toast.error(data.message);
                return navigate("/");
            }
            setTitle(data.blog.title);
            setSubTitle(data.blog.subTitle || "");
            setCategory(data.blog.category);
            setExistingImage(data.blog.image);
            quillRef.current.setText("");
            quillRef.current.clipboard.dangerouslyPasteHTML(data.blog.description);
        } catch (error) {
            toast.error(getErrorMessage(error));
            navigate("/");
        }
    };

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();

            if (!image && !isEditing) return toast.error("Please upload a thumbnail");
            if (quillRef.current.getText().trim().length === 0) return toast.error("Please write a blog description");

            setIsAdding(true);

            const blog = {
                title,
                subTitle,
                description: quillRef.current.root.innerHTML,
                category,
            };

            const formData = new FormData();
            formData.append("blog", JSON.stringify(blog));
            // When editing, the thumbnail is only sent if a new one was picked
            if (image) formData.append("image", image);

            const { data } = isEditing ? await axios.put(`/api/blog/update/${id}`, formData, { headers: { "x-owner-key": getOwnerKey(id) } }) : await axios.post("/api/blog/add", formData);

            if (data.success) {
                if (!isEditing) saveOwnerKey(data.blogId, data.ownerKey);
                toast.success(data.message);
                await fetchBlogs();
                navigate(`/blog/${data.blogId}`);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsAdding(false);
        }
    };

    useEffect(() => {
        // Initiate Quill only once
        if (!quillRef.current && editorRef.current) {
            quillRef.current = new Quill(editorRef.current, { theme: "snow" });
        }
        if (isEditing) loadBlog();
    }, []);

    const thumbnail = image ? URL.createObjectURL(image) : existingImage || assets.upload_area;

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
            <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
                <Navbar />
            </div>
            <form onSubmit={onSubmitHandler} className="flex justify-center text-gray-600 dark:text-zinc-300 sm:py-6">
                <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl p-4 md:p-10 sm:m-4 shadow rounded">
                    {isEditing && <h1 className="text-xl font-semibold text-gray-800 dark:text-zinc-100 mb-6">Edit blog</h1>}

                    <p>{isEditing ? "Thumbnail (click to replace)" : "Upload thumbnail"}</p>
                    <label htmlFor="image">
                        <img src={thumbnail} alt="" className="mt-2 h-20 rounded cursor-pointer" />
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" accept="image/png, image/jpeg, image/webp, image/gif" hidden />
                    </label>

                    <p className="mt-4">Generate with AI</p>
                    <div className="flex flex-col sm:flex-row gap-2 max-w-xl mt-2">
                        <input type="text" placeholder="Enter a topic, e.g. How AI is changing education" maxLength={500} className="w-full p-2 border border-gray-300 dark:border-zinc-700 bg-transparent outline-none rounded" onChange={(e) => setPrompt(e.target.value)} value={prompt} />
                        <button type="button" onClick={generateContent} disabled={isGenerating} className="shrink-0 px-5 py-2 bg-primary text-on-primary rounded cursor-pointer text-sm disabled:opacity-60">
                            {isGenerating ? "Generating..." : "Generate with AI"}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">AI fills the title, subtitle and description below. You can edit everything before publishing.</p>

                    <p className="mt-4">Blog title</p>
                    <input type="text" placeholder="Type here" required maxLength={150} className="w-full max-w-xl mt-2 p-2 border border-gray-300 dark:border-zinc-700 bg-transparent outline-none rounded" onChange={(e) => setTitle(e.target.value)} value={title} />

                    <p className="mt-4">Sub title</p>
                    <input type="text" placeholder="Type here" maxLength={250} className="w-full max-w-xl mt-2 p-2 border border-gray-300 dark:border-zinc-700 bg-transparent outline-none rounded" onChange={(e) => setSubTitle(e.target.value)} value={subTitle} />

                    <p className="mt-4">Blog Description</p>
                    <div className="max-w-xl h-74 pb-16 sm:pb-10 pt-2 relative">
                        <div ref={editorRef}></div>
                        {isGenerating && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 mt-2">
                                <div className="w-8 h-8 rounded-full border-2 border-t-white animate-spin"></div>
                            </div>
                        )}
                    </div>

                    <p className="mt-4">Blog category</p>
                    <select onChange={(e) => setCategory(e.target.value)} value={category} name="category" required className="mt-2 px-3 py-2 border text-gray-500 dark:text-zinc-300 dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 outline-none rounded">
                        {categories.map((item, index) => {
                            return (
                                <option key={index} value={item}>
                                    {item}
                                </option>
                            );
                        })}
                    </select>

                    <div className="flex gap-3">
                        <button disabled={isAdding || isGenerating} type="submit" className="mt-8 w-40 h-10 bg-primary text-on-primary rounded cursor-pointer text-sm disabled:opacity-60">
                            {isAdding ? (isEditing ? "Saving..." : "Publishing...") : isEditing ? "Save changes" : "Publish"}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={() => navigate(`/blog/${id}`)} className="mt-8 w-28 h-10 border border-gray-300 dark:border-zinc-700 rounded cursor-pointer text-sm">
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddBlog;
