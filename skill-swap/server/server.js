import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

import connectDB from "./config/db.js";
import { initSocket } from "./socket/socket.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import swapRoutes from "./routes/swapRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

import errorHandler from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Socket init
initSocket(server);

// ✅ DB connect
connectDB();

// ✅ Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ Routes
app.get("/", (req, res) => {
  res.send("SkillSwap API running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // ✅ FIXED
app.use("/api/swaps", swapRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);

// ✅ 404 HANDLER
app.use((req, res, next) => {
  console.log("❌ Route not found:", req.originalUrl);

  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ✅ ERROR HANDLER
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});