import express, { urlencoded } from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./src/config/database.js";
import userRoutes from "./src/routes/userRoutes.js";
import blogRoutes from "./src/routes/blogRoutes.js";
import commentRoutes from "./src/routes/commentRoutes.js";
import cookieParser from "cookie-parser";
import { auth } from "./src/middlewares/auth.js";
import multer from "multer";
import { Blog } from "./src/models/blog.js";
import renderRoutes from "./src/routes/renderRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import searchRoutes from "./src/routes/searchRoutes.js";
import session from "express-session";
import jwt from "jsonwebtoken";
import methodOverride from "method-override";
import { error } from "console";

const app = express();
dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// set up view engine to use EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// Public the Public folder
app.use("/public", express.static(path.join(__dirname, "src", "public")));
// Public the assets folder
app.use("/assets", express.static(path.join(__dirname, "src", "assets")));

// Middlewares

app.use(methodOverride("_method"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use((req, res, next) => {
  const token = req.cookies.authHeader?.split(" ")[1];

  if (!token) {
    res.locals.role = "unAuth-Visitor";
    res.locals.user = null;
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    res.locals.role = decoded.role || "unAuth-Visitor";
    res.locals.user = decoded;
  } catch (err) {
    res.locals.role = "unAuth-Visitor";
    res.locals.user = null;
  }
  next();
});

app.use((req, res, next) => {
  res.locals.modal = req.session.modal;
  delete req.session.modal;
  next();
});

// Routes

app.use("/user", userRoutes);
app.use("/blog", blogRoutes);
app.use("/comment", commentRoutes);
app.use("/", renderRoutes);
app.use("/admin", adminRoutes);
app.use("/blogs", searchRoutes);
app.use("/*splat", (req, res) => {
  throw new Error("This is invalid route!");
});

app.use((err, req, res, next) => {
  res.render("pages/invalid", { title: 404 }, (err, html) => {
    res.render("layout", { body: html, title: 404, currentPage: "Invalid" });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
