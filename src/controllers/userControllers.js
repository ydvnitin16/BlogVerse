import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

// Register User
async function userRegister(req, res) {
  try {
    const { name, email, password } = req.body;
    const hashedPwd = await bcrypt.hash(password, 10);
    const role = req.body.role || "visitor";

    const user = User({
      name,
      email,
      password: hashedPwd,
      role,
    });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    res.status(500).send("Server error.");
  }
}

async function userLogin(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials." });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid Credentials." });
    const token = jwt.sign(
      {
        userId: user._id,
        userName: user.name,
        role: user.role,
        userEmail: user.email,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "3d",
      }
    );
    res.cookie("authHeader", `Bearer ${token}`, {
      maxAge: 259200000,
      httpOnly: true,
      secure: false,
    });
    res.redirect("/");
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
}

async function editProfile(req, res) {
  const { name, role, password } = req.body;
  const hashedPwd = await bcrypt.hash(password, 10);
  const _id = req.user.userId;
  if (req.passwordChanged) {
    await User.findByIdAndUpdate(_id, {
      name: name,
      role: role,
      password: hashedPwd,
    });
  } else {
    await User.findByIdAndUpdate(_id, { name, role });
  }

  // Fetch updated user data
  const updatedUser = await User.findById(_id);

  // Issue new JWT with updated data
  const token = jwt.sign(
    {
      userId: updatedUser._id,
      userName: updatedUser.name,
      role: updatedUser.role,
      userEmail: updatedUser.email,
    },
    process.env.SECRET_KEY,
    { expiresIn: "3d" }
  );

  // Reset cookie with new token
  res.cookie("authHeader", `Bearer ${token}`, {
    maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
    httpOnly: true,
    secure: false,
  });

  res.redirect("/profile");
}

export { userRegister, userLogin, editProfile };
