import { LoginCredentials, SignupCredentials, User } from "../types/auth";
import { api } from "./axios";

export const authService = {
  register: (payload: SignupCredentials) => api.post("/auth/register", payload),

  login: (payload: LoginCredentials) => api.post("/auth/login", payload),

  logout: () => api.post("/auth/logout", { withCredentials: true }),

  isAuthorized: () => api.get("/auth/me", { withCredentials: true }),

  async getMe(): Promise<User> {
    const res = await api.get("/auth/me");
    return (res.data as any).user ?? res;
  },

  async update(data: { nickname?: string; email?: string; password?: string; new_password?: string }): Promise<User> {
    const res = await api.put("/auth", data, { withCredentials: true });
    return (res.data as any).user ?? res;
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await api.post("/auth/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return (res.data as any).user ?? res;
  },
};
