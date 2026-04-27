"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Attempt = {
  id: string;
  totalScore: number | null;
  resultLabel: string | null;
  startedAt: string;
};

type Weakness = {
  id: string;
  category: string;
  accuracy: number;
  weaknessLevel: string | null;
};

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me");

      if (!meRes.ok) {
        window.location.href = "/login";
        return;
      }

      const meData = await meRes.json();
      setUser(meData.user);

      const progressRes = await fetch(`/api/users/${meData.user.id}/progress`);
      const progressData = await progressRes.json();

      setAttempts(progressData.attempts || []);
      setWeaknesses(progressData.weaknesses || []);
      setLoading(false);
    }

    load().catch((err) => {
      console.error("Failed to load dashboard:", err);
      setLoading(false);
    });
  }, []);

  const bestScore = attempts.length
    ? Math.max(...attempts.map((a) => a.totalScore || 0))
    : 0;

  const latestResult = attempts[attempts.length - 1]?.resultLabel || "-";

  const averageScore = attempts.length
    ? Math.round(
        attempts.reduce((sum, a) => sum + (a.totalScore || 0), 0) /
          attempts.length
      )
    : 0;

  const scoreTrendData = useMemo(() => {
    return attempts.map((a, index) => ({
      name: `Test ${index + 1}`,
      score: a.totalScore || 0,
    }));
  }, [attempts]);

  const weaknessChartData = useMemo(() => {
    return weaknesses.map((w) => ({
      category: w.category,
      accuracy: Number(w.accuracy.toFixed(1)),
    }));
  }, [weaknesses]);

  const lowestWeakness = useMemo(() => {
    if (weaknesses.length === 0) return null;

    return [...weaknesses].sort((a, b) => a.accuracy - b.accuracy)[0];
  }, [weaknesses]);

  function getRecommendation() {
    if (!lowestWeakness) {
      return "Take one practice test first. Your weak areas will appear here after attempts.";
    }

    if (lowestWeakness.accuracy < 50) {
      return `Focus strongly on ${lowestWeakness.category}. Your accuracy is low, so do short daily practice sessions in this topic.`;
    }

    if (lowestWeakness.accuracy < 75) {
      return `Improve ${lowestWeakness.category}. You are close, but need more practice for consistency.`;
    }

    return `Good progress. Keep reviewing ${lowestWeakness.category} and start more timed mock exams.`;
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="mt-2 text-zinc-600">
              {user
                ? `Welcome, ${user.name || user.email}`
                : "Track your scores and progress"}
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/practice"
              className="rounded-xl bg-black px-4 py-2 text-white hover:bg-zinc-800"
            >
              Practice
            </a>

            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }}
              className="rounded-xl border bg-white px-4 py-2 hover:bg-zinc-50"
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            Loading dashboard...
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="rounded-3xl bg-white p-6 shadow">
                <div className="text-sm text-zinc-500">Total Attempts</div>
                <div className="mt-3 text-3xl font-bold">
                  {attempts.length}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow">
                <div className="text-sm text-zinc-500">Best Score</div>
                <div className="mt-3 text-3xl font-bold">{bestScore}</div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow">
                <div className="text-sm text-zinc-500">Average Score</div>
                <div className="mt-3 text-3xl font-bold">{averageScore}</div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow">
                <div className="text-sm text-zinc-500">Latest Result</div>
                <div className="mt-3 text-2xl font-bold">{latestResult}</div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">Score Trend</h2>
                  <p className="text-sm text-zinc-500">
                    Your mock exam score progress over time.
                  </p>
                </div>

                <div className="h-72">
                  {scoreTrendData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-zinc-500">
                      No attempts yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={scoreTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="score"
                          strokeWidth={3}
                          dot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">Category Accuracy</h2>
                  <p className="text-sm text-zinc-500">
                    Your accuracy by weak category.
                  </p>
                </div>

                <div className="h-72">
                  {weaknessChartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-zinc-500">
                      No weakness data yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weaknessChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="accuracy" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl bg-black p-6 text-white shadow lg:col-span-1">
                <h2 className="text-xl font-semibold">Smart Recommendation</h2>
                <p className="mt-3 text-zinc-300">{getRecommendation()}</p>

                {lowestWeakness && (
                  <div className="mt-5 rounded-2xl bg-white/10 p-4">
                    <div className="text-sm text-zinc-300">Priority Topic</div>
                    <div className="mt-1 text-2xl font-bold">
                      {lowestWeakness.category}
                    </div>
                    <div className="mt-1 text-sm text-zinc-300">
                      Accuracy: {lowestWeakness.accuracy.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-white p-6 shadow lg:col-span-2">
                <h2 className="text-xl font-semibold">Recent Attempts</h2>

                <div className="mt-4 space-y-3">
                  {attempts.length === 0 ? (
                    <div className="text-zinc-500">No attempts yet.</div>
                  ) : (
                    attempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between rounded-2xl border p-4"
                      >
                        <div>
                          <div className="font-medium">
                            Attempt #{attempt.id.slice(0, 6)}
                          </div>
                          <div className="text-sm text-zinc-500">
                            {new Date(attempt.startedAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {attempt.totalScore ?? 0}
                          </div>
                          <div className="text-sm text-zinc-500">
                            {attempt.resultLabel || "-"}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow">
              <a
  href="/student/assignments"
  className="rounded-3xl bg-white p-6 font-black shadow"
>
  My Assignments
</a>
              <h2 className="text-xl font-semibold">Weak Areas Detail</h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {weaknesses.length === 0 ? (
                  <div className="text-zinc-500">No weakness data yet.</div>
                ) : (
                  weaknesses.map((w) => (
                    <div key={w.id} className="rounded-2xl border p-4">
                      <div className="font-semibold">{w.category}</div>
                      <div className="mt-1 text-sm text-zinc-500">
                        Level: {w.weaknessLevel || "-"}
                      </div>
                      <div className="mt-3 h-3 rounded-full bg-zinc-100">
                        <div
                          className="h-3 rounded-full bg-black"
                          style={{ width: `${Math.min(w.accuracy, 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 text-sm font-medium">
                        {w.accuracy.toFixed(1)}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}