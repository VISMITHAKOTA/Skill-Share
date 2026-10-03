import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // ✅ prevent double call

    try {
      setLoading(true);

      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      if (!data?.token) {
        throw new Error("Invalid login response");
      }

      login(data);

      navigate("/dashboard");

    } catch (error) {
      console.error("LOGIN ERROR:", error.response?.data || error.message);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={(e) => setEmail(e.target.value)} />
      <input type="password" onChange={(e) => setPassword(e.target.value)} />

      <button disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default Login;