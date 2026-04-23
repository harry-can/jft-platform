"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/users/REPLACE_USER_ID/progress")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-xl p-4">
          <div className="text-sm text-muted-foreground">Total Attempts</div>
          <div className="text-2xl font-bold">{data.attempts.length}</div>
        </div>
        <div className="border rounded-xl p-4">
          <div className="text-sm text-muted-foreground">Best Score</div>
          <div className="text-2xl font-bold">{Math.max(0, ...data.attempts.map((a: any) => a.totalScore || 0))}</div>
        </div>
        <div className="border rounded-xl p-4">
          <div className="text-sm text-muted-foreground">Latest Result</div>
          <div className="text-2xl font-bold">{data.attempts.at(-1)?.resultLabel || "-"}</div>
        </div>
      </div>

      <div className="border rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-3">Weak Areas</h2>
        <div className="space-y-2">
          {data.weaknesses.map((w: any) => (
            <div key={w.id} className="flex justify-between border-b pb-2">
              <span>{w.category}</span>
              <span>{w.accuracy.toFixed(1)}% ({w.weaknessLevel})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}