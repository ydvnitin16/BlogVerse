import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { User } from "../models/user.js";

dotenv.config();

const validateForm = async (req, res, next) => {
  const { email, password, name } = req.body;
  if (
    [email, password, name].some(
      (field) => field === null || field === undefined || field === ""
    )
  ) {
    return res.status(400).json({ message: "Enter the correct fields." });
  }
  if (!email.endsWith("@gmail.com")) {
    return res.status(400).json({
      message: "please enter correct gmail address[ends with @gmail.com]",
    });
  }
  next();
};

const isEmailExists = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) return res.status(404).json({ message: "Email already exists." });
  next();
};

const auth = async (req, res, next) => {
  const authHeader = req.cookies.authHeader;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.redirect("/unauthorized")
    return;
    // return res.status(401).json({ message: "Unauthorized." });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Invalid token." });
  }
};

const validateUpdation = async (req, res, next) => {
  const _id = req.user.userId;
  const user = await User.findById(_id);
  let { name, role, password, confirmPwd } = req.body;

    if (name === null || name === undefined || name === "") {
      return res.status(400).json({ message: "please enter correct fields." });
    }
    
    if (role !== 'author' && role !== 'visitor') {
      role = user.role;
    }

  if (password === "" || password === undefined || password === null) {
     req.passwordChanged = false;
     return next()
  }
  if(password !== "" && password !== undefined && password !== null){
    if(password === confirmPwd){
      console.log(`Password req`)
      req.passwordChanged = true
    }else{
      res.json({message: "Please enter a valid fields"})
    }
  }
  next()
};

export { validateForm, isEmailExists, auth, validateUpdation };
