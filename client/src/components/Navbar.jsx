import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
    const { navigate, theme, toggleTheme } = useAppContext();
    const isDark = theme === "dark";

    return (
        <div className="flex justify-between items-center py-5 sm:py-8 mx-8 sm:mx-20 xl:mx-32">
            <img onClick={() => navigate("/")} src={isDark ? assets.logo_light : assets.logo} alt="logo" className="w-32 sm:w-36 cursor-pointer" />
            <div className="flex items-center gap-3">
                <button onClick={toggleTheme} title={isDark ? "Switch to light mode" : "Switch to dark mode"} aria-label="Toggle theme" className="flex items-center justify-center size-10 rounded-full border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer transition-all">
                    {isDark ? (
                        // Sun icon
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="4" />
                            <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
                        </svg>
                    ) : (
                        // Moon icon
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    )}
                </button>
                <button onClick={() => navigate("/add-blog")} className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-on-primary px-6 sm:px-10 py-2.5">
                    Publish Blog
                    <img src={assets.arrow} className="w-3 dark:invert" alt="arrow" />
                </button>
            </div>
        </div>
    );
};

export default Navbar;
