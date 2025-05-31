import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  commentContent: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

const Comment = mongoose.model("Comment", commentSchema);

export { Comment };
