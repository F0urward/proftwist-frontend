import { LoginCredentials, SignupCredentials } from "../types/auth";
import { api } from "./axios";

export const authService = {
  register: (payload: SignupCredentials) => api.post("/auth/register", payload),

  login: (payload: LoginCredentials) => api.post("/auth/login", payload),

  logout: () => api.post("/auth/logout"),
};
