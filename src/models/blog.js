import mongoose from "mongoose";

const blogSchema = mongoose.Schema({
  image: {
    url: String,
    public_id: String,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    enum: [
      "Technology",
      "Startup",
      "Self-Improvement",
      "Career",
      "Education",
      "Finance",
      "Gaming",
      "Creative",
      "Health",
      "Lifestyle",
    ],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

const Blog = mongoose.model("Blog", blogSchema);

export { Blog };
