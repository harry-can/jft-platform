"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("student1@example.com");
  const [password, setPassword] = useState("test1234");
  const [result, setResult] = useState<any>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setResult(data);

    if (!res.ok) {
      alert(data.error || "Login failed");
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Login</h1>

      <form onSubmit={handleLogin} className="space-y-4 border rounded-2xl p-6">
        <input
          className="border rounded-lg p-3 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border rounded-lg p-3 w-full"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="px-5 py-3 bg-black text-white rounded-xl w-full"
        >
          Login
        </button>
      </form>

      {result && (
        <pre className="bg-gray-100 p-4 rounded-xl text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}