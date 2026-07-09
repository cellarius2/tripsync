import api from "./api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types";

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/register", data);
    return res.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/login", data);
    return res.data;
  },

  async getMe() {
    const res = await api.get("/auth/me");
    return res.data;
  },

  async updateAvatar(data: { avatarUrl: string; avatarColor?: string }) {
    const res = await api.patch("/auth/me/avatar", data);
    return res.data;
  },
};