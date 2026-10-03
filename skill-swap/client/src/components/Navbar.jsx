import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout, userInfo } = useAuth();

  const handleLogout = () => {
    console.log("🔥 Logout clicked"); // ✅ DEBUG

    logout();

    // ✅ FORCE NAVIGATION AFTER STATE UPDATE
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 50);
  };

  return (
    <div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow">

      <h2
        className="text-lg font-bold cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        SkillSwap
      </h2>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">
          {userInfo?.name || "User"}
        </span>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;