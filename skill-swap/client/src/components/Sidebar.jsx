import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white p-5">
      <h2 className="text-xl font-bold mb-6">SkillSwap</h2>

      <ul className="space-y-4">
        <li><Link to="/dashboard">🏠 Dashboard</Link></li>
        <li><Link to="/profile">👤 Profile</Link></li>
        <li><Link to="/marketplace">💼 Marketplace</Link></li>
        <li><Link to="/chat">💬 Chat</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;