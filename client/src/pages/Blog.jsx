import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import Navbar from "../components/Navbar";
import Moment from "moment";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { useAppContext, getErrorMessage, sampleBlogs, getOwnerKey, removeOwnerKey } from "../context/AppContext";
import toast from "react-hot-toast";

const Blog = () => {
    const { id } = useParams();

    const { axios, navigate, fetchBlogs } = useAppContext();

    const [data, setData] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Only the browser that published this blog holds its owner key
    const isOwner = Boolean(getOwnerKey(id));

    const deleteBlog = async () => {
        if (!window.confirm("Are you sure you want to delete this blog? This cannot be undone.")) return;
        try {
            setIsDeleting(true);
            const { data } = await axios.delete(`/api/blog/delete/${id}`, { headers: { "x-owner-key": getOwnerKey(id) } });
            if (data.success) {
                removeOwnerKey(id);
                toast.success(data.message);
                await fetchBlogs();
                navigate("/");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsDeleting(false);
        }
    };

    const fetchBlogData = async () => {
        // Sample blogs live in the frontend, no API call needed
        const sample = sampleBlogs.find((blog) => blog._id === id);
        if (sample) return setData(sample);

        try {
            const { data } = await axios.get(`/api/blog/published/${id}`);
            if (data.success) {
                setData(data.blog);
            } else {
                toast.error(data.message);
                navigate("/");
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
            navigate("/");
        }
    };

    useEffect(() => {
        setData(null);
        fetchBlogData();
    }, [id]);

    return data ? (
        <div className="relative">
            <img src={assets.gradientBackground} alt="" className="absolute -top-50 -z-1 opacity-50 dark:opacity-10" />

            <Navbar />

            <div className="text-center mt-20 text-gray-600 dark:text-zinc-400">
                <p className="text-primary py-4 font-medium">Published on {Moment(data.createdAt).format("MMMM Do YYYY")}</p>
                <h1 className="text-2xl sm:text-5xl font-semibold max-w-2xl mx-auto text-gray-800 dark:text-zinc-100">{data.title}</h1>
                <h2 className="my-5 max-w-lg truncate mx-auto">{data.subTitle}</h2>
                <p className="inline-block py-1 px-4 rounded-full mb-6 border text-sm border-primary/35 bg-primary/5 font-medium text-primary">{data.category}</p>

                {isOwner && (
                    <div className="flex justify-center gap-3 mb-2">
                        <button onClick={() => navigate(`/edit-blog/${id}`)} className="px-6 py-2 text-sm rounded-full bg-primary text-on-primary cursor-pointer hover:scale-102 transition-all">
                            Edit blog
                        </button>
                        <button onClick={deleteBlog} disabled={isDeleting} className="px-6 py-2 text-sm rounded-full border border-red-500 text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950 transition-all disabled:opacity-60">
                            {isDeleting ? "Deleting..." : "Delete blog"}
                        </button>
                    </div>
                )}
            </div>

            <div className="mx-5 max-w-5xl md:mx-auto my-10 mt-6">
                <img src={data.image} alt="" className="rounded-3xl mb-5" />

                <div className="reset-tw max-w-3xl mx-auto dark:text-zinc-300" dangerouslySetInnerHTML={{ __html: data.description }}></div>

                {/* Share Buttons */}
                <div className="my-24 max-w-3xl mx-auto">
                    <p className="font-semibold my-4 dark:text-zinc-100">Share this article on social media</p>
                    <div className="flex">
                        <img src={assets.facebook_icon} width={50} alt="" />
                        <img src={assets.twitter_icon} width={50} alt="" />
                        <img src={assets.linkedin_icon} width={50} alt="" />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    ) : (
        <Loader />
    );
};

export default Blog;
