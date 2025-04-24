const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const BlackList = require("../models/Blacklist.model");
require("dotenv").config();

// Register New User
exports.addNewUser = async (req, res) => {
  try {
    const { name, email, password, city, gender, bio } = req.body;
    const profileImage = req.file ? req.file.path : null;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 8);

    // Create and save user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      city,
      gender,
      bio,
      profileImage,
      recipes: [],
      savedRecipes: [],
      likedRecipes: [],
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "User registration failed" });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User does not exist. Please register." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" }); // 👈 Login fail here
    }

    // ✅ Password matched
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.status(200).json({ message: `Welcome back ${user.name}`, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// Logout User
exports.logoutUser = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    if (token) {
      const blacklistedToken = new BlackList({ token });
      await blacklistedToken.save();
      return res.status(200).json({ message: "Logged out successfully" });
    } else {
      return res.status(400).json({ message: "No token provided" });
    }
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
};
