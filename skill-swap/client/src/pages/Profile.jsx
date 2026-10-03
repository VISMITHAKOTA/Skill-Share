import { useEffect, useState } from "react";
import API from "../services/api";

const Profile = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    skillsOffered: "",
    skillsWanted: "",
  });

  const [loading, setLoading] = useState(false);

  // FETCH PROFILE
  const fetchProfile = async () => {
    try {
      setLoading(true);

      const { data } = await API.get("/users/profile");

      console.log("PROFILE DATA:", data);

      setForm({
        name: data.name || "",
        email: data.email || "",
        skillsOffered: data.skillsOffered?.join(", ") || "",
        skillsWanted: data.skillsWanted?.join(", ") || "",
      });

    } catch (error) {
      console.error("PROFILE ERROR:", error.response?.data || error.message);
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // UPDATE PROFILE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await API.put("/users/profile", form);

      console.log("UPDATED:", data);

      alert("Profile updated successfully ✅");

      fetchProfile();

    } catch (error) {
      console.error("UPDATE ERROR:", error.response?.data || error.message);
      alert("Update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl mb-4">Profile</h2>

      {loading && <p>Loading...</p>}

      <form onSubmit={handleSubmit} className="space-y-3">

        <input
          className="p-2 bg-gray-800 w-full"
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          className="p-2 bg-gray-700 w-full"
          value={form.email}
          disabled
        />

        <input
          className="p-2 bg-gray-800 w-full"
          placeholder="Skills Offered"
          value={form.skillsOffered}
          onChange={(e) =>
            setForm({ ...form, skillsOffered: e.target.value })
          }
        />

        <input
          className="p-2 bg-gray-800 w-full"
          placeholder="Skills Wanted"
          value={form.skillsWanted}
          onChange={(e) =>
            setForm({ ...form, skillsWanted: e.target.value })
          }
        />

        <button className="bg-blue-500 px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
};

export default Profile;