import { cloudinary } from "../config/cloudinary.js";
import { Blog } from "../models/blog.js";
import { Comment } from "../models/comment.js";
import dotenv from "dotenv";
dotenv.config()

// Create Blog Function
async function createBlog(req, res) {
  try {
    const { title, content, category } = req.body;
    const author = req.user.userId;

    let image = {
      url: `https://res.cloudinary.com/${process.env.CLOUD_NAME}/image/upload/v1748774190/default-blog_zlgebl.png`,
      public_id: 'default-blog_zlgebl',
    }

    if(req.file){
      image = {
        url: req.file.path,
        public_id: req.file.filename,
      }
    }

    const blog = Blog({
      image,
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

// Get Blog By Id
async function getBlog(req, res) {
  const id = req.params.id;
  const blog = await Blog.findById(id).populate("author");
  const comments = await Comment.find({ blogId: id }).populate("userId");

  res.render(
    "pages/blogPage",
    { title: "BlogVerse", blog, comments },
    (err, html) => {
      if (err) {
        return res.status(500).send("Error rendering blog page.");
      }
      res.render("layout", {
        title: "BlogVerse",
        body: html,
        currentPage: "Blog",
      });
    }
  );
}

// Delete Blog
async function deleteBlog(req, res) {
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

    if(blog.image?.public_id && blog.image?.public_id !== 'default-blog_zlgebl') {
      await cloudinary.uploader.destroy(blog.image.public_id);
    }

    try {
      await Comment.deleteMany({ blogId: req.params.id });
    } catch (err) {
      console.log(err.message);
    }

    await blog.deleteOne();
    res.redirect("/");
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// Edit Blog
async function editBlog(req, res) {
  try {
    const { title, content, category } = req.body;
    const role = req.user.role;

    if (
      [title, content, category].some(
        (field) => field === null || field === undefined || field.trim() === ""
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

    if(req.file){
      if(existingBlog.image?.public_id  && existingBlog.image?.public_id !== 'default-blog_zlgebl'){
        await cloudinary.uploader.destroy(existingBlog.image.public_id);
      }
      existingBlog.image = {
        url: req.file.path,
        public_id: req.file.filename,
      }
    }

    existingBlog.title = title;
    existingBlog.content = content;
    existingBlog.category = category;
    await existingBlog.save();
    res.redirect(`/blog/${req.params.id}`);
  } catch (err) {
    console.log(err.message);
    res.json({ message: "Server Error." });
  }
}

export { createBlog, getBlog, deleteBlog, editBlog };
