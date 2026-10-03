import { Link, useNavigate } from "react-router-dom";

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-blue-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">SkillSwap</h2>

        <nav className="flex flex-col gap-4">
          <Link to="/dashboard">🏠 Dashboard</Link>
          <Link to="/profile">👤 Profile</Link>
          <Link to="/marketplace">💼 Marketplace</Link>
        </nav>

        <button
          onClick={logout}
          className="mt-10 bg-red-500 px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 p-6 bg-gray-900 text-white overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;
