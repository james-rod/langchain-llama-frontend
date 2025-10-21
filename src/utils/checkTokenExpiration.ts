import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";

type DecodedToken = {
  exp: number; // Expiration time as a Unix timestamp
};

export const checkTokenExpiration = (onExpire?: () => void) => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const { logout } = useAuthStore.getState();
  const { clearConversation } = useChatStore.getState();

  if (user?.token) {
    try {
      const decoded = jwtDecode<DecodedToken>(user.token);
      const currentTime = Date.now() / 1000; // Current time in seconds

      if (decoded.exp < currentTime) {
        // Token has expired
        logout();
        clearConversation();

        console.log("🔒 Token expired — user logged out and chat cleared.");
      }
    } catch (error) {
      logout();
      clearConversation();
      console.log("Invalid token. User logged out.");
    }
  }
};
