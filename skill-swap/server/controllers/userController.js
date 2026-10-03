import User from "../models/User.js";

// =====================================
// GET ALL USERS (MARKETPLACE + SEARCH)
// =====================================
// GET /api/users?search=react
export const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;

    // ================= SEARCH FILTER =================
    const keyword = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { skillsOffered: { $regex: search, $options: "i" } },
            { skillsWanted: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // ================= FETCH USERS =================
    const users = await User.find({
      _id: { $ne: req.user._id }, // exclude logged user
      ...keyword,
    })
      .select("_id name email skillsOffered skillsWanted createdAt")
      .sort({ createdAt: -1 });

    res.json({
      count: users.length,
      users,
    });

  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);
    res.status(500).json({
      message: "Server error while fetching users",
    });
  }
};


// =====================================
// GET LOGGED-IN USER PROFILE
// =====================================
export const getProfile = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user._id).select(
      "_id name email skillsOffered skillsWanted"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      skillsOffered: user.skillsOffered || [],
      skillsWanted: user.skillsWanted || [],
    });

  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({
      message: "Server error while fetching profile",
    });
  }
};


// =====================================
// UPDATE USER PROFILE
// =====================================
export const updateProfile = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let { name, skillsOffered, skillsWanted } = req.body;

    // ================= VALIDATION =================
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    // ================= FORMAT SKILLS =================
    const formatSkills = (skills) => {
      if (!skills) return [];

      if (typeof skills === "string") {
        return skills.split(",").map(s => s.trim()).filter(Boolean);
      }

      if (Array.isArray(skills)) {
        return skills.map(s => s.trim()).filter(Boolean);
      }

      return [];
    };

    skillsOffered = formatSkills(skillsOffered);
    skillsWanted = formatSkills(skillsWanted);

    // ================= UPDATE =================
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.skillsOffered = skillsOffered;
    user.skillsWanted = skillsWanted;

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      skillsOffered: updatedUser.skillsOffered,
      skillsWanted: updatedUser.skillsWanted,
    });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({
      message: "Server error while updating profile",
    });
  }
};