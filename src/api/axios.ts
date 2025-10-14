import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 10000,
});

// interceptors: auth header, refresh token, global error handling
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers!["Authorization"] = `Bearer ${token}`;
  return cfg;
});
