import { api } from "@/lib/api";
import type { User } from "@/types";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    return response.user;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch("http://localhost:8000/api/v1/users?limit=1", {
        credentials: "include",
      });
      
      if (!response.ok) {
        return null;
      }
      
      const users = await response.json();
      if (users && users.length > 0) {
        return users[0];
      }
      return null;
    } catch (error) {
      return null;
    }
  },
};
