import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Footer = () => {
    const { theme } = useAppContext();

    return (
        <div className="px-6 md:px-16 lg:px-24 xl:px-32 bg-primary/3">
            <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-500/30 text-gray-500 dark:text-zinc-400">
                <div>
                    <img src={theme === "dark" ? assets.logo_light : assets.logo} alt="logo" className="w-32 sm:w-44" />
                    <p className="max-w-[410px] mt-6">Blogify is an AI-powered blogging platform where anyone can write, generate and publish stories in minutes. Share your ideas on technology, startups, lifestyle and finance with readers everywhere.</p>
                </div>

                <div>
                    <h3 className="font-semibold text-base text-gray-900 dark:text-zinc-100 md:mb-5 mb-2">Contact Us</h3>
                    <ul className="text-sm space-y-2">
                        <li>
                            Email:{" "}
                            <a href="mailto:manisha@gmail.com" className="hover:underline transition">
                                manisha@gmail.com
                            </a>
                        </li>
                        <li>
                            Phone:{" "}
                            <a href="tel:+919876543210" className="hover:underline transition">
                                +91 98765 43210
                            </a>
                        </li>
                        <li>Location: Bengaluru, India</li>
                    </ul>
                </div>
            </div>
            <p className="py-4 text-center text-sm md:text-base text-gray-500/80 dark:text-zinc-500">Copyright 2026 © Blogify AI - All Rights Reserved.</p>
        </div>
    );
};

export default Footer;
