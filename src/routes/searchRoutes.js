import express from "express";
import { Blog } from "../models/blog.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  let search = req.query.search;

  const formattedSearch = search
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  const blogs = await Blog.find({ category: formattedSearch });

  res.render("pages/home", { title: "BlogVerse", blogs }, (err, html) => {
    res.render("layout", {
      title: "BlogVerse",
      body: html,
      currentPage: "Home",
    });
  });
});

router.get("/", async (req, res) => {
  const category = req.query.category;
  const blogs = await Blog.find({ category: category });

  res.render("pages/home", { title: "BlogVerse", blogs }, (err, html) => {
    res.render("layout", {
      title: "BlogVerse",
      body: html,
      currentPage: "Home",
    });
  });
});

export default router;
