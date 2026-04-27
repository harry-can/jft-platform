
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentHomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function loadHome() {
    try {
      await fetch("/api/student/notifications/generate-reminders", {
        method: "POST",
      });

      const res = await fetch("/api/student/home");
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to load dashboard");

      setData(json);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  loadHome();
}, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (!data) return <div className="p-6">No data found.</div>;

  const rec = data.recommendations;

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow">
          <p className="font-bold text-blue-700">JFT/N4 Learning Loop</p>
          <h1 className="mt-2 text-4xl font-black">
            Welcome, {data.user.name || data.user.email}
          </h1>
          <p className="mt-3 text-slate-600">
            Learn → Practice → Test → Analyze → Retry Wrong Questions → Improve Weakness → Retest
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Card title="Readiness" value={rec.readinessLabel} />
            <Card title="Readiness Score" value={`${rec.readinessScore}%`} />
            <Card title="XP" value={data.user.xp} />
            <Card title="Streak" value={`${data.user.streakDays} days`} />
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-7">
          <LoopCard step="1" title="Learn" href="/learn" />
          <LoopCard step="2" title="Practice" href="/practice" />
          <LoopCard step="3" title="Test" href="/exams" />
          <LoopCard step="4" title="Analyze" href="/student/report" />
          <LoopCard
            step="5"
            title="Retry"
            href={rec.pendingWrongRetry?.[0] ? `/wrong-retry/${rec.pendingWrongRetry[0].id}` : "/student/report"}
          />
          <LoopCard
            step="6"
            title="Improve"
            href={rec.weakest ? `/practice?category=${rec.weakest.category}` : "/practice"}
          />
          <LoopCard step="7" title="Retest" href="/exams" />
        </section>
        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow">
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <h2 className="text-2xl font-black">Notifications & Reminders</h2>
      <p className="mt-2 text-slate-600">
        Check new assignments, overdue work, result updates, and wrong-question reminders.
      </p>
    </div>

    <a
      href="/notifications"
      className="rounded-2xl bg-black px-5 py-3 text-center font-bold text-white"
    >
      Open Notifications
    </a>
  </div>
</section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow">
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <h2 className="text-2xl font-black">Class Assignments</h2>
      <p className="mt-2 text-slate-600">
        Check assigned practice sets, due dates, completion status, and latest scores.
      </p>
    </div>

    <a
      href="/student/assignments"
      className="rounded-2xl bg-black px-5 py-3 text-center font-bold text-white"
    >
      Open Assignments
    </a>
  </div>
</section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-2xl font-black">Recommended Next Action</h2>

            <div className="mt-5 space-y-4">
              {rec.recommendations.map((item: any) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="block rounded-2xl border p-5 hover:bg-slate-50"
                >
                  <div className="font-black">{item.title}</div>
                  <p className="mt-2 text-slate-600">{item.message}</p>
                  <div className="mt-3 font-bold text-blue-700">{item.action} →</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-2xl font-black">Weakness Summary</h2>

            {rec.weakest ? (
              <div className="mt-5 rounded-2xl border p-5">
                <div className="text-sm text-slate-500">Weakest category</div>
                <div className="mt-2 text-3xl font-black">{rec.weakest.category}</div>
                <div className="mt-2 text-slate-600">
                  Accuracy: {Number(rec.weakest.accuracy).toFixed(1)}%
                </div>
              </div>
            ) : (
              <p className="mt-4 text-slate-500">No weakness data yet. Start practice first.</p>
            )}

            <Link
              href="/student/report"
              className="mt-5 inline-block rounded-2xl bg-black px-5 py-3 font-bold text-white"
            >
              View Full Report
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}

function LoopCard({ step, title, href }: { step: string; title: string; href: string }) {
  return (
    <Link href={href} className="rounded-3xl bg-white p-5 text-center font-black shadow hover:bg-slate-50">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
        {step}
      </div>
      <div className="mt-3">{title}</div>
    </Link>
  );
}
