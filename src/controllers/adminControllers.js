import { User } from "../models/user.js";
import fs from "fs/promises";
import path from "path";
import { Blog } from "../models/blog.js";
import { Comment } from "../models/comment.js";

async function manageUser(req, res) {
  const users = await User.find();
  res.render("pages/user-manage", { title: "Blog App", users }, (err, html) => {
    if (err) {
      return res.status(500).send("Error rendering blog page.");
    }
    res.render("layout", {
      title: "Blog App",
      body: html,
      currentPage: "User Manage",
    });
  });
}

async function changeRole(req, res) {
  const id = req.params.id;
  const { role } = req.body;

  await User.findByIdAndUpdate(id, { role: role });
  req.session.modal = { type: "success", message:  'Role Updated'}
  res.redirect("/admin/all-users");
}

async function deleteUser(req, res) {
  try {
    const id = req.params.id;

    await User.findByIdAndDelete(id);

    try {
      const blogs = await Blog.find({ author: id });
      const blogIds = blogs.map((blog) => blog._id);
      const blogsImagePublicIds = blogs.map((blog) => blog.image.public_id);

      await Promise.all(
        blogsImagePublicIds.map((public_id) => {
          if (public_id !== "default-blog_zlgebl") {
            return cloudinary.uploader.destroy(public_id);
          }
        })
      );

      await Blog.deleteMany({ author: id });

      await Comment.deleteMany({ userId: id });

      await Comment.deleteMany({ blogId: { $in: blogIds } });
      
    } catch (err) {
      console.error(err);
    }
    req.session.modal = { type: "success", message:  'User Deleted'}
    res.redirect("/admin/all-users");
  } catch (err) {
    req.session.modal = { type: "error", message:  'Server Error'}
    res.json({ message: "Server Error." });
  }
}

async function searchUser(req, res) {
  const { name_email, role } = req.query;
  let query = {};

  if (name_email) {
    query.$or = [{ name: name_email }, { email: name_email }];
  }

  if (role) {
    query.role = role;
  }

  const users = await User.find(query);

  res.render(
    "pages/user-manage",
    { title: "BlogVerse", users },
    (err, html) => {
      res.render("layout", {
        title: "BlogVerse",
        body: html,
        currentPage: "User Manage",
      });
    }
  );
}

export { manageUser, changeRole, deleteUser, searchUser };
