"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import { useAuth } from "@/app/hooks/useAuth";
import "./Login.css";
import axios from "axios";

type LoginResponse = {
  user: {
    id: number;
    username: string;
    email: string;
  };
  token: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axiosClient.post<LoginResponse>(
        "/auth/login",
        form
      );
      const { user, token } = response.data;
      setUser({ ...user, token });
      localStorage.setItem("token", token);
      router.push("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Login failed");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Login Faild: Unknown error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="Login-title">Login</h1>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="login-input"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="login-input"
          required
        />

        <button type="submit" disabled={isLoading} className="login-Button">
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
