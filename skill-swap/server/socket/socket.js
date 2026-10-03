import { Server } from "socket.io";
import Message from "../models/Message.js";

let io;

// 🟢 Track online users
const onlineUsers = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // 🔐 change in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // ===============================
    // 🔗 JOIN
    // ===============================
    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId);

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // ===============================
    // 💬 SEND MESSAGE (TEXT + MEDIA)
    // ===============================
    socket.on("sendMessage", async (data) => {
      try {
        const { sender, receiver, text, image } = data;

        if (!text && !image) return;

        let status = "sent";

        if (onlineUsers.has(receiver)) {
          status = "delivered";
        }

        const newMessage = await Message.create({
          sender,
          receiver,
          text,
          image,
          status,
        });

        io.to(receiver).emit("receiveMessage", newMessage);
        io.to(sender).emit("messageStatusUpdate", newMessage);
      } catch (err) {
        console.error(err.message);
      }
    });

    // ===============================
    // ✍️ TYPING
    // ===============================
    socket.on("typing", ({ sender, receiver }) => {
      io.to(receiver).emit("typing", sender);
    });

    socket.on("stopTyping", ({ sender, receiver }) => {
      io.to(receiver).emit("stopTyping", sender);
    });

    // ===============================
    // 👁️ SEEN
    // ===============================
    socket.on("markSeen", async ({ sender, receiver }) => {
      await Message.updateMany(
        { sender, receiver, status: { $ne: "seen" } },
        { status: "seen" }
      );

      io.to(sender).emit("messagesSeen", { receiver });
    });

    // ===============================
    // 📞 CALL SIGNALING
    // ===============================
    socket.on("callUser", ({ to, from, offer }) => {
      io.to(to).emit("incomingCall", { from, offer });
    });

    socket.on("acceptCall", ({ to, answer }) => {
      io.to(to).emit("callAccepted", { answer });
    });

    socket.on("rejectCall", ({ to }) => {
      io.to(to).emit("callRejected");
    });

    socket.on("iceCandidate", ({ to, candidate }) => {
      io.to(to).emit("iceCandidate", candidate);
    });

    socket.on("endCall", ({ to }) => {
      io.to(to).emit("callEnded");
    });

    // ===============================
    // ❌ DISCONNECT
    // ===============================
    socket.on("disconnect", () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  });
};

export const getIO = () => io;