import { useNavigate } from "react-router-dom";

const BlogCard = ({ blog }) => {
    const { title, description, category, image, _id } = blog;
    const navigate = useNavigate();
    // Plain-text preview of the HTML description
    const preview = description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);

    return (
        <div onClick={() => navigate(`/blog/${_id}`)} className="w-full rounded-lg overflow-hidden shadow hover:scale-102 hover:shadow-primary/25 duration-300 cursor-pointer bg-white dark:bg-zinc-900 dark:shadow-black/40">
            <img src={image} alt="" className="aspect-video w-full object-cover" />
            <span className="ml-5 mt-4 px-3 py-1 inline-block bg-primary/10 rounded-full text-primary text-xs">{category}</span>
            <div className="p-5">
                <h5 className="mb-2 font-medium text-gray-900 dark:text-zinc-100">{title}</h5>
                <p className="mb-3 text-xs text-gray-600 dark:text-zinc-400">{preview}...</p>
            </div>
        </div>
    );
};

export default BlogCard;
