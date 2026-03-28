import { create } from "zustand";

type Authority = "ADMIN" | "USER" | null;

interface UserInfo {
  id: number;
  name: string;
  loginId: string;
}

interface AuthState {
  authority: Authority;
  user: UserInfo | null;
  setAuth: (authority: Authority, user: UserInfo) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  authority:
    typeof window !== "undefined"
      ? (localStorage.getItem("authority") as Authority)
      : null,
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") ?? "null")
      : null,

  setAuth: (authority, user) => {
    localStorage.setItem("authority", authority ?? "");
    localStorage.setItem("user", JSON.stringify(user));
    document.cookie = `authority=${authority}; path=/; max-age=86400`;
    set({ authority, user });
  },

  clearAuth: () => {
    localStorage.removeItem("authority");
    localStorage.removeItem("user");
    document.cookie = "authority=; path=/; max-age=0";
    set({ authority: null, user: null });
  },
}));