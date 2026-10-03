import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { userInfo, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // ================= FETCH DATA =================
  useEffect(() => {
    if (loading) return;
    if (!userInfo?.token) {
      // ✅ CLEAR STATE AFTER LOGOUT
      setUsers([]);
      setMe(null);
      return;
    }

    const fetchData = async () => {
      try {
        const [profileRes, usersRes] = await Promise.all([
          API.get("/users/profile"),
          API.get("/users"),
        ]);

        setMe(profileRes.data);
        setUsers(usersRes.data.users || []);

      } catch (err) {
        console.error("Dashboard error:", err.response?.data || err.message);
      }
    };

    fetchData();
  }, [userInfo, loading]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Checking authentication...
      </div>
    );
  }

  // ================= MATCH LOGIC (SAFE) =================
  const matchedUsers =
    me && users.length > 0
      ? users.filter((user) => {
          return (
            user.skillsOffered?.some((skill) =>
              me.skillsWanted?.includes(skill)
            ) ||
            user.skillsWanted?.some((skill) =>
              me.skillsOffered?.includes(skill)
            )
          );
        })
      : [];

  // ================= FAVORITES =================
  const toggleFavorite = (user) => {
    const exists = favorites.find((f) => f._id === user._id);

    if (exists) {
      setFavorites(favorites.filter((f) => f._id !== user._id));
    } else {
      setFavorites([...favorites, user]);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6 text-white">
        Dashboard 🚀
      </h1>

      {/* MATCHED USERS */}
      <h2 className="text-xl text-green-400 mb-3">🎯 Best Matches</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {matchedUsers.length === 0 ? (
          <p className="text-white">No matches found</p>
        ) : (
          matchedUsers.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              toggleFavorite={toggleFavorite}
              favorites={favorites}
            />
          ))
        )}
      </div>

      {/* FAVORITES */}
      <h2 className="text-xl text-pink-400 mb-3">❤️ Favorites</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {favorites.length === 0 ? (
          <p className="text-white">No favorites yet</p>
        ) : (
          favorites.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              toggleFavorite={toggleFavorite}
              favorites={favorites}
            />
          ))
        )}
      </div>

      {/* ALL USERS */}
      <h2 className="text-xl text-blue-400 mb-3">🌐 All Users</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {users.length === 0 ? (
          <p className="text-white">No users available</p>
        ) : (
          users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              toggleFavorite={toggleFavorite}
              favorites={favorites}
            />
          ))
        )}
      </div>
    </Layout>
  );
};

// ================= USER CARD =================
const UserCard = ({ user, toggleFavorite, favorites }) => {
  const isFav = favorites.some((f) => f._id === user._id);

  return (
    <div className="bg-white/10 backdrop-blur p-4 rounded text-white shadow hover:scale-105 transition">

      <h3 className="font-bold text-lg">{user.name}</h3>
      <p className="text-sm text-gray-300">{user.email}</p>

      <p className="mt-2 text-green-300">
        <b>Offers:</b> {user.skillsOffered?.join(", ") || "None"}
      </p>

      <p className="text-yellow-300">
        <b>Wants:</b> {user.skillsWanted?.join(", ") || "None"}
      </p>

      <button
        onClick={() => toggleFavorite(user)}
        className={`mt-3 px-3 py-1 rounded transition ${
          isFav
            ? "bg-red-500 hover:bg-red-600"
            : "bg-gray-700 hover:bg-gray-600"
        }`}
      >
        {isFav ? "Remove ❤️" : "Add ❤️"}
      </button>
    </div>
  );
};

export default Dashboard;