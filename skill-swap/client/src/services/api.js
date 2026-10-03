import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (userInfo?.token && userInfo.token !== "undefined") {
      req.headers.Authorization = `Bearer ${userInfo.token}`;
    }
  } catch (err) {
    localStorage.removeItem("userInfo");
  }

  return req;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error("API ERROR:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      localStorage.removeItem("userInfo");
    }

    return Promise.reject(error);
  }
);

export default API;