import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { blog_data } from "../assets/assets";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

// Show the server's error message instead of Axios' generic "Request failed with status code 400"
export const getErrorMessage = (error) => error.response?.data?.message || error.message;

// Built-in sample blogs shown alongside the ones saved in MongoDB
export const sampleBlogs = blog_data;

// Owner keys for blogs published from this browser: { [blogId]: key }.
// The key lets this browser edit or delete the blog.
const readOwnerKeys = () => {
    try {
        return JSON.parse(localStorage.getItem("ownerKeys")) || {};
    } catch {
        return {};
    }
};

export const getOwnerKey = (blogId) => readOwnerKeys()[blogId];

export const saveOwnerKey = (blogId, key) => {
    try {
        localStorage.setItem("ownerKeys", JSON.stringify({ ...readOwnerKeys(), [blogId]: key }));
    } catch {}
};

export const removeOwnerKey = (blogId) => {
    try {
        const keys = readOwnerKeys();
        delete keys[blogId];
        localStorage.setItem("ownerKeys", JSON.stringify(keys));
    } catch {}
};

const getInitialTheme = () => {
    try {
        const saved = localStorage.getItem("theme");
        if (saved) return saved;
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();

    const [blogs, setBlogs] = useState(sampleBlogs);
    const [input, setInput] = useState("");
    const [theme, setTheme] = useState(getInitialTheme);

    const fetchBlogs = async () => {
        try {
            const { data } = await axios.get("/api/blog/all");
            data.success ? setBlogs([...data.blogs, ...sampleBlogs]) : toast.error(data.message);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        try {
            localStorage.setItem("theme", theme);
        } catch {}
    }, [theme]);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const value = {
        axios,
        navigate,
        blogs,
        setBlogs,
        input,
        setInput,
        fetchBlogs,
        theme,
        toggleTheme,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    return useContext(AppContext);
};
