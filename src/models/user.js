import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["visitor", "author", "admin"],
    default: "visitor",
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

const User = mongoose.model("User", userSchema);

export { User };
