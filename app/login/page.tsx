"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("student1@example.com");
  const [password, setPassword] = useState("test1234");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login failed");
        setLoading(false);
        return;
      }

      if (data.role === "admin") {
        window.location.href = "/admin/questions";
        return;
      }

      if (data.role === "teacher") {
        window.location.href = "/teacher/classes";
        return;
      }

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong during login");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="mt-2 text-zinc-500">Sign in to continue</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            className="w-full rounded-2xl border p-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full rounded-2xl border p-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-black px-5 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-zinc-100 p-4 text-sm">
          <p className="font-semibold">Test Accounts</p>
          <p>Student: student1@example.com / test1234</p>
          <p>Teacher: teacher1@example.com / test1234</p>
          <p>Admin: admin1@example.com / test1234</p>
        </div>
      </div>
    </div>
  );
}