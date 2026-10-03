import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= INIT AUTH =================
  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("userInfo"));

        if (!stored?.token) {
          setUserInfo(null);
          setLoading(false);
          return;
        }

        // ✅ VERIFY TOKEN
        const { data } = await API.get("/users/profile");

        setUserInfo({
          ...stored,
          name: data.name,
          email: data.email,
        });

      } catch (error) {
        console.error("AUTH INIT ERROR:", error?.response?.data);

        // ❌ INVALID TOKEN → CLEAR
        localStorage.removeItem("userInfo");
        setUserInfo(null);

      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ================= LOGIN =================
  const login = (data) => {
    if (!data?.token) {
      console.error("Invalid login response");
      return;
    }

    localStorage.setItem("userInfo", JSON.stringify(data));
    setUserInfo(data);
  };

  // ================= LOGOUT =================
  const logout = () => {
  console.log("🚪 Logging out...");

  localStorage.removeItem("userInfo");
  setUserInfo(null);
};

  return (
    <AuthContext.Provider value={{ userInfo, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);