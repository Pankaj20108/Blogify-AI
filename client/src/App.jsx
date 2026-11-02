import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import AddBlog from "./pages/author/AddBlog";
import "quill/dist/quill.snow.css";
import { Toaster } from "react-hot-toast";

const App = () => {
    return (
        <div>
            <Toaster />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog/:id" element={<Blog />} />
                {/* Same form for both; the key forces a fresh form when switching between them */}
                <Route path="/add-blog" element={<AddBlog key="add" />} />
                <Route path="/edit-blog/:id" element={<AddBlog key="edit" />} />
                {/* Old author panel links now go straight to the publish page */}
                <Route path="/author/*" element={<Navigate to="/add-blog" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
};

export default App;
