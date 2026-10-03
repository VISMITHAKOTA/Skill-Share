import { useEffect, useState, useRef } from "react";
import socket from "../services/socket";
import axios from "axios";

const Chat = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const fileInputRef = useRef();

  const user = JSON.parse(localStorage.getItem("user"));

  // ================= SOCKET =================
  useEffect(() => {
    socket.emit("join", user._id);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("messageStatusUpdate", (msg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? msg : m))
      );
    });

    socket.on("typing", () => setTyping(true));
    socket.on("stopTyping", () => setTyping(false));

    socket.on("onlineUsers", setOnlineUsers);

    socket.on("messagesSeen", ({ receiver }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.receiver === receiver ? { ...m, status: "seen" } : m
        )
      );
    });

    return () => socket.off();
  }, []);

  // ================= FETCH =================
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await axios.get(`/api/chat/${selectedUser._id}`);
      setMessages(res.data);

      socket.emit("markSeen", {
        sender: selectedUser._id,
        receiver: user._id,
      });
    };

    fetchMessages();
  }, [selectedUser]);

  // ================= SEND =================
  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      sender: user._id,
      receiver: selectedUser._id,
      text,
    });

    setMessages((prev) => [
      ...prev,
      { text, sender: user._id, status: "sent" },
    ]);

    setText("");
  };

  // ================= FILE UPLOAD =================
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sender", user._id);
    formData.append("receiver", selectedUser._id);

    const res = await axios.post("/api/upload", formData);

    socket.emit("sendMessage", {
      sender: user._id,
      receiver: selectedUser._id,
      image: res.data.image,
    });
  };

  // ================= TYPING =================
  const handleTyping = (e) => {
    setText(e.target.value);

    socket.emit("typing", {
      sender: user._id,
      receiver: selectedUser._id,
    });

    setTimeout(() => {
      socket.emit("stopTyping", {
        sender: user._id,
        receiver: selectedUser._id,
      });
    }, 1000);
  };

  // ================= UI =================
  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <div className="p-3 border-b flex justify-between">
        <span>{selectedUser.name}</span>
        <span>
          {onlineUsers.includes(selectedUser._id)
            ? "🟢 Online"
            : "⚫ Offline"}
        </span>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div key={i} className="mb-3">

            {m.text && <p>{m.text}</p>}

            {m.image && (
              <img
                src={m.image}
                alt="media"
                className="w-40 rounded mt-2"
              />
            )}

            <small className="text-gray-400">
              {m.status === "seen" && "✔✔"}
              {m.status === "delivered" && "✔✔ (grey)"}
              {m.status === "sent" && "✔"}
            </small>
          </div>
        ))}

        {typing && <p className="text-sm">Typing...</p>}
      </div>

      {/* INPUT */}
      <div className="flex p-2 gap-2">
        <input
          value={text}
          onChange={handleTyping}
          className="flex-1 p-2 border rounded"
        />

        <input
          type="file"
          ref={fileInputRef}
          hidden
          onChange={handleFileUpload}
        />

        <button onClick={() => fileInputRef.current.click()}>
          📎
        </button>

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;