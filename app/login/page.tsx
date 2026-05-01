"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("student1@example.com");
  const [password, setPassword] = useState("test1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Login API returned non-JSON response. Status: ${res.status}`);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      window.location.href = data.redirectTo || "/student/home";
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function quickFill(type: "student" | "teacher" | "admin") {
    if (type === "student") {
      setEmail("student1@example.com");
      setPassword("test1234");
    }

    if (type === "teacher") {
      setEmail("teacher1@example.com");
      setPassword("test1234");
    }

    if (type === "admin") {
      setEmail("admin1@example.com");
      setPassword("test1234");
    }

    setError("");
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-2">
        <section className="hidden lg:block">
          <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-10 text-white shadow-2xl">
            <p className="font-bold text-blue-200">JFT / N4 Platform</p>

            <h1 className="mt-5 text-6xl font-black leading-tight">
              Learn. Practice. Test. Improve.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              A smart exam preparation system with official-style tests,
              wrong-question retry, weakness analysis, class assignments, and reports.
            </p>

            <div className="mt-10 grid gap-4">
              {[
                "Smart student dashboard",
                "Admin question bank",
                "Teacher class assignments",
                "Wrong-question recursive retry",
                "Full analysis reports",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 p-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                    ✓
                  </div>
                  <div className="font-bold">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-[2.5rem] bg-white p-8 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-black text-3xl text-white">
                🎌
              </div>

              <h2 className="mt-6 text-4xl font-black">Login</h2>
              <p className="mt-2 text-slate-500">
                Access your JFT/N4 learning platform.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <label className="block">
                <span className="font-bold">Email</span>
                <input
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student1@example.com"
                  required
                />
              </label>

              <label className="block">
                <span className="font-bold">Password</span>
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border border-slate-300 p-4 outline-none transition focus:border-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="test1234"
                  required
                />
              </label>

              {error && (
                <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-black px-6 py-4 font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-6">
              <div className="text-center text-sm font-bold text-slate-500">
                Quick demo login
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => quickFill("student")}
                  className="rounded-xl border p-3 text-sm font-bold hover:bg-slate-50"
                >
                  Student
                </button>

                <button
                  type="button"
                  onClick={() => quickFill("teacher")}
                  className="rounded-xl border p-3 text-sm font-bold hover:bg-slate-50"
                >
                  Teacher
                </button>

                <button
                  type="button"
                  onClick={() => quickFill("admin")}
                  className="rounded-xl border p-3 text-sm font-bold hover:bg-slate-50"
                >
                  Admin
                </button>
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-slate-500">
              Need an account?{" "}
              <Link href="/register" className="font-black text-black">
                Register
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-white p-5 text-sm text-slate-600 shadow">
            <div className="font-black text-slate-900">Demo accounts</div>
            <div className="mt-2 space-y-1">
              <div>Admin: admin1@example.com / test1234</div>
              <div>Teacher: teacher1@example.com / test1234</div>
              <div>Student: student1@example.com / test1234</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}