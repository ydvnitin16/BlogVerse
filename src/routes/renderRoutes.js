import express from "express";
import { Blog } from "../models/blog.js";
import { auth } from "../middlewares/auth.js";
import { User } from "../models/user.js";
import { checkRole } from "../middlewares/roleCheck.js";

const router = express.Router();

// render home page
router.get("/", async (req, res) => {
  const blogs = await Blog.find().sort({ date: -1 }).populate("author");
  res.render("pages/home", { title: "BlogVerse", blogs }, (err, html) => {
    res.render("layout", {
      title: "BlogVerse",
      body: html,
      currentPage: "Home",
    });
  });
});

// render signup page
router.get("/signup", (req, res) => {
  res.render("pages/signup", { title: "BlogVerse" }, (err, html) => {
    res.render("layout", {
      title: "BlogVerse",
      body: html,
      currentPage: "Signup",
    });
  });
});

// render login page
router.get("/login", (req, res) => {
  res.render("pages/login", { title: "BlogVerse" }, (err, html) => {
    res.render("layout", {
      title: "BlogVerse",
      body: html,
      currentPage: "Login",
    });
  });
});

// render create blog page
router.get("/create-blog", auth, checkRole("author", "admin"), (req, res) => {
  res.render("pages/createBlog", { title: "BlogVerse" }, (err, html) => {
    res.render("layout", {
      title: "BlogVerse",
      body: html,
      currentPage: "Create Blog",
    });
  });
});

// get my blogs

router.get(
  "/my-blogs",
  auth,
  checkRole("author", "admin"),
  async (req, res) => {
    const blogs = await Blog.find({ author: req.user.userId })
      .sort({ date: -1 })
      .populate("author");
    res.render("pages/myBlogs", { title: "BlogVerse", blogs }, (err, html) => {
      res.render("layout", {
        title: "BlogVerse",
        body: html,
        currentPage: "My Blogs",
      });
    });
  }
);

// profile page

router.get("/profile", auth, async (req, res) => {
  const _id = req.user.userId;
  const user = await User.findById(_id);
  res.render("pages/profile", { title: "BlogVerse", user }, (err, html) => {
    res.render("layout", {
      title: "BlogVerse",
      body: html,
      currentPage: "Profile",
    });
  });
});

router.get("/profile/edit", auth, async (req, res) => {
  const _id = req.user.userId;
  const roles = ["visitor", "author"];
  const user = await User.findById(_id);
  res.render(
    "pages/editProfile",
    { title: "BlogVerse", user, roles },
    (err, html) => {
      res.render("layout", {
        title: "BlogVerse",
        body: html,
        currentPage: "Edit Profile",
      });
    }
  );
});

router.get("/unauthorized", async (req, res) => {
  res.render("pages/unauthorized", { title: "BlogVerse" }, (err, html) => {
    res.render("layout", {
      title: "BlogVerse",
      body: html,
      currentPage: "Unauthorized Page",
    });
  });
});

router.get(
  "/blog/:id/edit",
  auth,
  checkRole("author", "admin"),
  async (req, res) => {
    const role = req.user.role;
    const query =
      role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id, author: req.user.userId };

    const blog = await Blog.findOne(query);

    if (!blog) {
      return res.status(404).send("Blog not found");
    }
    res.render("pages/editBlog", { title: "BlogVerse", blog }, (err, html) => {
      res.render("layout", {
        title: "BlogVerse",
        body: html,
        currentPage: "Edit Blog",
      });
    });
  }
);

router.get("/about", async (req, res) => {
  res.render("pages/about", { title: "BlogVerse" }, (err, html) => {
    res.render("layout", {
      title: "BlogVerse",
      body: html,
      currentPage: "About",
    });
  });
});

router.get("/privacy-policy", async (req, res) => {
  res.render("pages/privacy-policy", { title: "BlogVerse" }, (err, html) => {
    res.render("layout", {
      title: "BlogVerse",
      body: html,
      currentPage: "Privacy Policy",
    });
  });
});

router.get("/contact", async (req, res) => {
  res.render("pages/contact", { title: "BlogVerse" }, (err, html) => {
    res.render("layout", {
      title: "BlogVerse",
      body: html,
      currentPage: "Contact",
    });
  });
});

export default router;
