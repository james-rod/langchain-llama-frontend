import { useAuthStore } from "@/store/useAuthStore";

export function useAuth() {
  const { user, setUser, logout } = useAuthStore();
  return { user, setUser, logout };
}
