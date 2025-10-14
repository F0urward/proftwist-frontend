import { api } from "./axios";

export const authService = {
  register: (payload: { username: string; email: string; password: string }) =>
    api.post("/auth/register", payload),

  login: (payload: { email: string; password: string }) =>
    api.post("/auth/login", payload),

  logout: () => api.post("/auth/logout"),
};
