"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { checkTokenExpiration } from "@/utils/checkTokenExpiration";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { clearConversation } = useChatStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    checkTokenExpiration();
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    clearConversation();
    localStorage.removeItem("chat-storage");
  };

  if (!isMounted) return null; // Prevent hydration mismatch

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">
          Langchain-llama-Demo-Chat
        </Link>

        <ul className="navbar-links">
          {user ? (
            <>
              <li>Welcome, {user.username}</li>
              <li>
                <Link href={"/"}>Home</Link>
              </li>
              <li>
                <button className="navbar-logout" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href={"/auth/login"}>Login</Link>
              </li>
              <li>
                <Link href={"/auth/register"}>Sign-Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
