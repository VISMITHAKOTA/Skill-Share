import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

const Marketplace = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const sendRequest = async (receiverId) => {
    try {
      await axios.post(
        "/api/swaps",
        { receiverId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Swap Request Sent 🔥");
    } catch (err) {
      toast.error("Failed ❌");
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl mb-4">Marketplace</h1>

      <div className="grid grid-cols-3 gap-4">
        {users.map((u) => (
          <div key={u._id} className="bg-white/10 p-4 rounded">
            <p className="font-bold">{u.name}</p>
            <p>{u.skills?.join(", ")}</p>

            <button
              onClick={() => sendRequest(u._id)}
              className="mt-2 bg-green-500 px-3 py-1 rounded"
            >
              Request Swap
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Marketplace;
