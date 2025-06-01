import express from "express";
import { User } from "../models/user.js";
import { auth } from "../middlewares/auth.js";
import { checkRole } from "../middlewares/roleCheck.js";
import { Blog } from "../models/blog.js";
import { Comment } from "../models/comment.js";
import fs from "fs/promises";
import path from "path";
import { changeRole, deleteUser, manageUser, searchUser } from "../controllers/adminControllers.js";

const router = express.Router();

// Render all users.
router.get("/all-users", auth, checkRole("admin"), manageUser);

// Change user role
router.post("/:id/change-role", auth, checkRole("admin"), changeRole);

// Delete user
router.post("/:id/delete", auth, checkRole("admin"), deleteUser);

// Search user by roles.
router.get("/user", auth, checkRole("admin"), searchUser);

export default router;
