
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";

export default function StudentHomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHome() {
      try {
        await fetch("/api/student/notifications/generate-reminders", {
          method: "POST",
        }).catch(() => null);

        const res = await fetch("/api/student/home");
        const json = await res.json();

        if (!res.ok) throw new Error(json.error || "Failed to load dashboard");
        setData(json);
      } catch (error) {
        alert(error instanceof Error ? error.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadHome();
  }, []);

  if (loading) {
    return (
      <AppShell role="student">
        <div className="grid min-h-[60vh] place-items-center">
          <div className="rounded-[2rem] bg-white p-8 text-center shadow">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-black" />
            <div className="mt-4 font-black">Loading your learning dashboard...</div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell role="student">
        <EmptyState
          title="No dashboard data found"
          description="Start learning or take your first practice test to generate your dashboard."
          href="/learn"
          action="Start Learning"
        />
      </AppShell>
    );
  }

  const rec = data.recommendations;

  return (
    <AppShell role="student">
      <section className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-8 text-white shadow-2xl">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-blue-100">
              JFT/N4 Smart Learning System
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
              Welcome back, <br />
              {data.user.name || data.user.email}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Your system is tracking learning, practice, test results, weakness,
              wrong-question retry, and readiness.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={rec.pendingWrongRetry?.[0] ? `/wrong-retry/${rec.pendingWrongRetry[0].id}` : "/practice"}
                className="rounded-2xl bg-white px-6 py-4 font-black text-slate-950"
              >
                Continue Practice
              </Link>

              <Link
                href="/student/report"
                className="rounded-2xl border border-white/20 px-6 py-4 font-black text-white"
              >
                View Report
              </Link>

              <Link
                href="/student/assignments"
                className="rounded-2xl border border-white/20 px-6 py-4 font-black text-white"
              >
                Assignments
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur">
            <div className="text-sm font-bold text-blue-200">Exam Readiness</div>
            <div className="mt-3 text-5xl font-black">{rec.readinessScore}%</div>
            <div className="mt-2 text-xl font-bold">{rec.readinessLabel}</div>

            <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${Math.min(100, rec.readinessScore)}%` }}
              />
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-300">
              Improve weak categories and clear wrong questions to increase readiness.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-4">
        <StatCard title="Readiness" value={rec.readinessLabel} icon="🎯" />
        <StatCard title="Score" value={`${rec.readinessScore}%`} icon="📈" />
        <StatCard title="XP" value={data.user.xp} icon="⚡" />
        <StatCard title="Streak" value={`${data.user.streakDays}d`} icon="🔥" />
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-7">
        <LoopCard step="1" title="Learn" href="/learn" icon="📘" />
        <LoopCard step="2" title="Practice" href="/practice" icon="📝" />
        <LoopCard step="3" title="Test" href="/exams" icon="🏆" />
        <LoopCard step="4" title="Analyze" href="/student/report" icon="📊" />
        <LoopCard
          step="5"
          title="Retry"
          href={rec.pendingWrongRetry?.[0] ? `/wrong-retry/${rec.pendingWrongRetry[0].id}` : "/student/report"}
          icon="🔁"
        />
        <LoopCard
          step="6"
          title="Improve"
          href={rec.weakest ? `/practice?category=${rec.weakest.category}` : "/practice"}
          icon="🚀"
        />
        <LoopCard step="7" title="Retest" href="/exams" icon="✅" />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Recommended Next Actions</h2>
          <p className="mt-2 text-slate-500">
            Your platform automatically decides what you should do next.
          </p>

          <div className="mt-6 space-y-4">
            {rec.recommendations.length === 0 ? (
              <EmptyState
                title="No recommendations yet"
                description="Complete a practice test to get smart recommendations."
                href="/practice"
                action="Start Practice"
              />
            ) : (
              rec.recommendations.map((item: any) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="block rounded-[1.5rem] border border-slate-200 p-5 transition hover:-translate-y-1 hover:border-black hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-black">{item.title}</div>
                      <p className="mt-2 leading-7 text-slate-600">{item.message}</p>
                    </div>

                    <div className="rounded-full bg-black px-4 py-2 text-sm font-black text-white">
                      Go
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Weakness Intelligence</h2>
          <p className="mt-2 text-slate-500">
            Know exactly what is stopping you from improving.
          </p>

          {rec.weakest ? (
            <div className="mt-6 rounded-[1.5rem] bg-red-50 p-6">
              <div className="text-sm font-bold text-red-600">Weakest Area</div>
              <div className="mt-2 text-4xl font-black text-red-950">
                {rec.weakest.category}
              </div>
              <div className="mt-3 text-red-700">
                Accuracy: {Number(rec.weakest.accuracy).toFixed(1)}%
              </div>

              <Link
                href={`/practice?category=${rec.weakest.category}`}
                className="mt-6 inline-block rounded-2xl bg-red-600 px-5 py-3 font-bold text-white"
              >
                Improve This Area
              </Link>
            </div>
          ) : (
            <EmptyState
              title="No weakness found yet"
              description="Take a practice test and the system will detect weak areas."
              href="/practice"
              action="Start Practice"
            />
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <FeatureLink
          title="My Assignments"
          description="See class work, due dates, and latest scores."
          href="/student/assignments"
          icon="📌"
        />
        <FeatureLink
          title="Notifications"
          description="Check reminders, results, and wrong-practice alerts."
          href="/notifications"
          icon="🔔"
        />
        <FeatureLink
          title="Study Plan"
          description="Generate a focused 7-day improvement plan."
          href="/student/study-plan"
          icon="🗓️"
        />
      </section>
    </AppShell>
  );
}

function LoopCard({
  step,
  title,
  href,
  icon,
}: {
  step: string;
  title: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[2rem] bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
        {icon}
      </div>
      <div className="mt-4 text-xs font-bold text-slate-400">STEP {step}</div>
      <div className="mt-1 font-black">{title}</div>
    </Link>
  );
}

function FeatureLink({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[2rem] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="text-4xl">{icon}</div>
      <div className="mt-4 text-xl font-black">{title}</div>
      <p className="mt-2 leading-7 text-slate-500">{description}</p>
    </Link>
  );
}
