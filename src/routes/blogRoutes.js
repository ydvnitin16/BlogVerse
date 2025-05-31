import express from "express";
import { Blog } from "../models/blog.js";
import { auth } from "../middlewares/auth.js";
import multer from "multer";
import { validateBlog } from "../middlewares/blog.js";
import { Comment } from "../models/comment.js";
import jwt from "jsonwebtoken";
import { checkRole } from "../middlewares/roleCheck.js";
import { Query } from "mongoose";
import fs from "fs/promises";
import path from "path";

// to save the files
const storage = multer.diskStorage({
  destination: "src/uploads",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + Date.now() + file.originalname);
  },
});

// uploads
const uploads = multer({
  storage,
  limits: {
    fileSize: 1024000 * 10,
  },
});

const router = express.Router();

// Create Blog

router.post(
  "/create-blog",
  auth,
  checkRole("author", "admin"),
  uploads.single("image"),
  validateBlog,
  async (req, res) => {
    try {
      const { title, content, category } = req.body;
      const imagePath = `uploads/${req.file.filename}`;
      console.log(imagePath);
      const author = req.user.userId;

      const blog = Blog({
        imagePath,
        title,
        content,
        category,
        author,
      });
      await blog.save();
      res.redirect("/");
      // return res.status(200).json({ message: "Blog posted", data: blog });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get Blogs By Id

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const blog = await Blog.findById(id).populate("author");
  const comments = await Comment.find({ blogId: id }).populate("userId");

  res.render(
    "pages/blogPage",
    { title: "BlogVerse", blog, comments },
    (err, html) => {
      res.render("layout", {
        title: "BlogVerse",
        body: html,
        currentPage: "Blog",
      });
    }
  );
});

// Delete Blog

router.post(
  "/:id/delete",
  auth,
  checkRole("author", "admin"),
  async (req, res) => {
    try {
      const role = req.user.role;
      const query =
        role === "admin"
          ? { _id: req.params.id }
          : { _id: req.params.id, author: req.user.userId };

      const blog = await Blog.findOne(query);

      if (!blog) {
        return res.json({ message: "Blog not found." });
      }

      const filePath = path.join("src", blog.imagePath);
      const filename = path.basename(filePath);

      try {
        if (filename !== 'default.png') {
          await fs.unlink(filePath);
          console.log(`Image deleted successfully.`);
        }

      } catch (err) {
        console.log(`Error deleting image: ${err.message}`);
      }

      try{
        await Comment.deleteMany({blogId: req.params.id});
      }catch(err){
        console.log(err.message);
      }

      await blog.deleteOne();
      res.redirect("/");
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Blog Edit

router.post(
  "/:id/edit",
  auth,
  checkRole("author", "admin"),
  uploads.single("image"),
  async (req, res) => {
    try {
      const { title, content, category } = req.body;
      const role = req.user.role;

      if (
        [title, content, category].some(
          (field) => field === null || field === undefined || field === ""
        )
      ) {
        return res.status(400).json({ message: "Fields can't be empty" });
      }
      const query =
        role === "admin"
          ? { _id: req.params.id }
          : { _id: req.params.id, author: req.user.userId };
      const existingBlog = await Blog.findOne(query);
      if (!existingBlog) {
        return res.status(404).send("Blog not found");
      }
      let imagePath;
      if (req.file) {
        imagePath = `uploads/${req.file.filename}`; // New image uploaded
      } else {
        imagePath = existingBlog.imagePath; // Keep old image
      }

      existingBlog.title = title;
      existingBlog.content = content;
      existingBlog.imagePath = imagePath;
      existingBlog.category = category;
      await existingBlog.save();
      res.redirect(`/blog/${req.params.id}`);
    } catch (err) {
      console.log(err.message);
      res.json({ message: "Server Error." });
    }
  }
);

export default router;
