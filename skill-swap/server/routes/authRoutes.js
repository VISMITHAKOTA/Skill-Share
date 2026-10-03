import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// ================= TOKEN GENERATOR =================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};


// =====================================
// ✅ REGISTER USER
// =====================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("REGISTER INPUT:", name, email, password);

    // ✅ Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // ✅ Check existing user
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log("USER SAVED:", user);

    res.status(201).json({
      message: "User registered successfully",
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id), // ✅ REAL JWT
    });

  } catch (error) {
    console.error("🔥 FULL REGISTER ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});


// =====================================
// ✅ LOGIN USER
// =====================================
router.post("/login", async (req, res) => {
  try {
    console.log("🔥 LOGIN API HIT");

    const { email, password } = req.body;

    console.log("LOGIN INPUT:", email, password);

    // ✅ Validate
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    // ✅ Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // ✅ Compare password (bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // ✅ Success (REAL TOKEN)
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id), // 🔥 FIXED
    });

  } catch (error) {
    console.error("🔥 LOGIN ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});


// =====================================
// ✅ GET CURRENT USER (Protected)
// =====================================
import protect from "../middleware/authMiddleware.js";

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "_id name email"
    );

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;