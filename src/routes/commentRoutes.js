import express from "express";
import { auth } from "../middlewares/auth.js";
import { Comment } from "../models/comment.js";
import { checkRole } from "../middlewares/roleCheck.js";

const router = express.Router();


// Post a comment

router.post("/:id", auth, checkRole('visitor', 'author', 'admin'), async (req, res) => {
  try {
    const { commentContent } = req.body;

    if (
      commentContent === null ||
      commentContent === undefined ||
      commentContent === ""
    ) {
      return res.json({ message: "Empty comment is not allowed." });
    }

    const comment = Comment({
      blogId: req.params.id,
      userId: req.user.userId,
      commentContent,
    });
    await comment.save();
    req.session.modal = { type: "success", message:  'Comment Posted'}
    res.redirect(`/blog/${req.params.id}`)
  } catch (err) {
    req.session.modal = { type: "error", message: 'Server Error'}
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
