import { create } from "zustand";
import { useChatStore } from "@/store/useChatStore";

type User = {
  id: number;
  username: string;
  email: string;
  token: string;
};

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    setUser: (user) => {
      localStorage.setItem("user", JSON.stringify(user));
      set({ user });
    },
    logout: () => {
      localStorage.removeItem("user");
      set({ user: null });
      useChatStore.getState().clearConversation();
      // ✅ Also clear persisted chat data manually
      localStorage.removeItem("chat-storage");
      console.log("✅ User logged out and chat cleared");
    },
  };
});
