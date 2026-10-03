import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // 👤 Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId; // ✅ allow Google login users
      },
      minlength: 6,
    },

    googleId: {
      type: String,
    },

    // 🧑‍💻 Profile
    bio: {
      type: String,
      default: "",
    },

    profilePic: {
      type: String,
      default: "",
    },

    // 🧠 Skills
    skillsOffered: [
      {
        type: String,
        trim: true,
      },
    ],

    skillsWanted: [
      {
        type: String,
        trim: true,
      },
    ],

    // ⭐ Rating System
    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // 🟢 Online Status
    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);


// =====================================
// 🔐 HASH PASSWORD (FIXED)
// =====================================
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// =====================================
// 🔑 COMPARE PASSWORD
// =====================================
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// =====================================
// 🚫 REMOVE PASSWORD FROM RESPONSE
// =====================================
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};


export default mongoose.model("User", userSchema);