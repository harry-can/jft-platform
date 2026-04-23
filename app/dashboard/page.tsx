"use client";

import { useEffect, useState } from "react";

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

export default function DashboardPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/REPLACE_USER_ID/progress")
      .then((r) => r.json())
      .then((data) => {
        setAttempts(data.attempts || []);
        setWeaknesses(data.weaknesses || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard:", err);
        setLoading(false);
      });
  }, []);

  const bestScore = attempts.length
    ? Math.max(...attempts.map((a) => a.totalScore || 0))
    : 0;

  const latestResult = attempts[attempts.length - 1]?.resultLabel || "-";

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="mt-2 text-zinc-600">
            Track your scores, weak areas, and learning progress.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-6 shadow">Loading dashboard...</div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="rounded-3xl bg-white p-6 shadow">
                <div className="text-sm text-zinc-500">Total Attempts</div>
                <div className="mt-3 text-3xl font-bold">{attempts.length}</div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow">
                <div className="text-sm text-zinc-500">Best Score</div>
                <div className="mt-3 text-3xl font-bold">{bestScore}</div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow">
                <div className="text-sm text-zinc-500">Latest Result</div>
                <div className="mt-3 text-2xl font-bold">{latestResult}</div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow">
                <div className="text-sm text-zinc-500">Weak Categories</div>
                <div className="mt-3 text-3xl font-bold">{weaknesses.length}</div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow">
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
                          <div className="font-medium">Attempt #{attempt.id.slice(0, 6)}</div>
                          <div className="text-sm text-zinc-500">
                            {new Date(attempt.startedAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{attempt.totalScore ?? 0}</div>
                          <div className="text-sm text-zinc-500">
                            {attempt.resultLabel || "-"}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow">
                <h2 className="text-xl font-semibold">Weak Areas</h2>
                <div className="mt-4 space-y-3">
                  {weaknesses.length === 0 ? (
                    <div className="text-zinc-500">No weakness data yet.</div>
                  ) : (
                    weaknesses.map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between rounded-2xl border p-4"
                      >
                        <div>
                          <div className="font-medium">{w.category}</div>
                          <div className="text-sm text-zinc-500">
                            Level: {w.weaknessLevel || "-"}
                          </div>
                        </div>
                        <div className="text-xl font-bold">{w.accuracy.toFixed(1)}%</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-black p-6 text-white shadow">
              <h2 className="text-xl font-semibold">Recommendation</h2>
              <p className="mt-3 text-zinc-300">
                Focus on your lowest-accuracy categories first. Do a short practice session
                every day and retake a mock exam weekly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}