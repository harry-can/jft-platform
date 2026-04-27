
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentReportPage() {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/report")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load report");
        setReport(data);
      })
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading report...</div>;
  if (!report) return <div className="p-6">No report found.</div>;

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 rounded-[2rem] bg-white p-8 shadow">
          <p className="font-bold text-blue-700">Student Analysis</p>
          <h1 className="mt-2 text-4xl font-black">My Report</h1>
          <p className="mt-3 text-slate-600">
            Your score, weakness, wrong retry, and attempt history.
          </p>
        </div>

        <section className="grid gap-5 md:grid-cols-4">
          <Card title="Attempts" value={report.summary.totalAttempts} />
          <Card title="Average Accuracy" value={`${report.summary.avgAccuracy}%`} />
          <Card title="Answered" value={report.summary.totalAnswered} />
          <Card title="Correct" value={report.summary.totalCorrect} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-2xl font-black">Weakness by Category</h2>

            <div className="mt-5 space-y-3">
              {report.weaknessProfiles.length === 0 ? (
                <p className="text-slate-500">No weakness data yet.</p>
              ) : (
                report.weaknessProfiles.map((w: any) => (
                  <div key={w.id} className="rounded-2xl border p-4">
                    <div className="flex justify-between">
                      <b>{w.category}</b>
                      <span>{Number(w.accuracy).toFixed(1)}%</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">{w.weaknessLevel}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-2xl font-black">Wrong Practice</h2>

            <div className="mt-5 space-y-3">
              {report.wrongRetrySets.length === 0 ? (
                <p className="text-slate-500">No pending wrong practice.</p>
              ) : (
                report.wrongRetrySets.map((set: any) => {
                  const unresolved = set.items.filter((i: any) => !i.isResolved).length;

                  return (
                    <Link
                      key={set.id}
                      href={`/wrong-retry/${set.id}`}
                      className="block rounded-2xl border p-4 hover:bg-slate-50"
                    >
                      <b>{set.sourceAttempt.practiceSet.title}</b>
                      <div className="mt-1 text-sm text-slate-500">
                        {unresolved} unresolved wrong question(s)
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow">
          <h2 className="text-2xl font-black">Recent Attempts</h2>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Set</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Accuracy</th>
                  <th className="p-3">Result</th>
                  <th className="p-3">View</th>
                </tr>
              </thead>
              <tbody>
                {report.attempts.map((a: any) => (
                  <tr key={a.id} className="border-b">
                    <td className="p-3">{a.practiceSet.title}</td>
                    <td className="p-3">{a.type}</td>
                    <td className="p-3">
                      {a.correctCount}/{a.totalQuestions}
                    </td>
                    <td className="p-3">{Number(a.accuracy || 0).toFixed(1)}%</td>
                    <td className="p-3">{a.resultLabel}</td>
                    <td className="p-3">
                      <Link className="font-bold text-blue-700" href={`/results/${a.id}`}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-3 text-3xl font-black">{value}</div>
    </div>
  );
}
