import express from "express";
import { Blog } from "../models/blog.js";
import { auth } from "../middlewares/auth.js";
import { validateBlog } from "../middlewares/blog.js";
import { checkRole } from "../middlewares/roleCheck.js";
import {
  createBlog,
  deleteBlog,
  editBlog,
  getBlog,
} from "../controllers/blogControllers.js";

import multer from "multer";
import { storage } from "../config/cloudinary.js";

// uploads
const uploads = multer({ storage });

const router = express.Router();

// Create Blog
router.post(
  "/create-blog",
  auth,
  checkRole("author", "admin"),
  uploads.single("image"),
  validateBlog,
  createBlog
);

// Get Blogs By Id
router.get("/:id", getBlog);

// Delete Blog
router.delete("/:id", auth, checkRole("author", "admin"), deleteBlog);

// Blog Edit
router.put(
  "/:id",
  auth,
  checkRole("author", "admin"),
  uploads.single("image"),
  editBlog
);

export default router;
