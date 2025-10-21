"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import type { AxiosError } from "axios";
import "./Register.css";

type RegisterResponse = {
  user: {
    id: number;
    username: string;
    email: string;
  };
  token: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axiosClient.post<RegisterResponse>(
        "/auth/register",
        form
      );
      const { token } = response.data;
      localStorage.setItem("token", token);
      router.push("/auth/login");
    } catch (error: unknown) {
      if (isAxiosError<{ message?: string }>(error)) {
        setError(error.response?.data?.message ?? "Registration Failed");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Registration Failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1 className="Register-Title">Register</h1>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="text"
          name="username"
          placeholder="username"
          value={form.username}
          onChange={handleChange}
          className="register-input"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="register-input"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="register-input"
          required
        />

        <button type="submit" disabled={isLoading} className="register-button">
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}

/**
 * Type guard to check if an error is an AxiosError
 */
function isAxiosError<T = unknown>(error: unknown): error is AxiosError<T> {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as AxiosError).isAxiosError === true
  );
}
