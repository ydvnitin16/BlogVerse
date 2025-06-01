import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import {
  auth,
  isEmailExists,
  validateForm,
  validateUpdation,
} from "../middlewares/auth.js";
import { editProfile, userLogin, userRegister } from "../controllers/userControllers.js";

const router = express.Router();

// register
router.post("/signup", validateForm, isEmailExists, userRegister);

// login
router.post("/login", userLogin);

// logout
router.delete("/logout", auth, (req, res) => {
  res.clearCookie("authHeader");
  res.redirect("/");
});

router.put("/edit", auth, validateUpdation, editProfile);

export default router;
