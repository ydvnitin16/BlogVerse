import express from "express";
import { User } from "../models/user.js";
import { auth } from "../middlewares/auth.js";
import { checkRole } from "../middlewares/roleCheck.js";
import { Blog } from "../models/blog.js";
import { Comment } from "../models/comment.js";
import fs from "fs/promises";
import path from "path";

const router = express.Router();

// Render all routes.
router.get("/all-users", auth, checkRole("admin"), async (req, res) => {
  const users = await User.find();
  res.render("pages/user-manage", { title: "Blog App", users }, (err, html) => {
    res.render("layout", {
      title: "Blog App",
      body: html,
      currentPage: "User Manage",
    });
  });
});

// Change user role
router.post("/:id/change-role", auth, checkRole("admin"), async (req, res) => {
  const id = req.params.id;
  const { role } = req.body;

  await User.findByIdAndUpdate(id, { role: role });
  res.redirect("/admin/all-users");
});

// Delete user
router.post("/:id/delete", auth, checkRole("admin"), async (req, res) => {
  try {
    const id = req.params.id;

    await User.findByIdAndDelete(id);

    try {
      const blogs = await Blog.find({ author: id });
      const blogIds = blogs.map((blog) => blog._id);
      const blogsImagePaths = blogs.map((blog) => blog.imagePath);

      blogsImagePaths.forEach((imagePath) => {
        const filePath = path.join("src", imagePath);
        const filename = path.basename(filePath);

        if (filename !== 'default.png') {
                  fs.unlink(filePath);
                  console.log(`Image deleted successfully.`);
                }
      });

      await Blog.deleteMany({ author: id });

      await Comment.deleteMany({ userId: id });

      await Comment.deleteMany({ blogId: { $in: blogIds } });
    } catch (err) {
      console.error(err);
    }

    res.redirect("/admin/all-users");
  } catch (err) {
    res.json({ message: "Server Error." });
  }
});

// Search user by roles.

router.get("/user", auth, checkRole("admin"), async (req, res) => {
  const { name_email, role } = req.query;
  let query = {};

  if (name_email) {
    query.$or = [{ name: name_email }, { email: name_email }];
  }

  if (role) {
    query.role = role;
  }

  const users = await User.find(query);

  res.render("pages/user-manage", { title: "Blog App", users }, (err, html) => {
    res.render("layout", {
      title: "Blog App",
      body: html,
      currentPage: "User Manage",
    });
  });
});

export default router;
