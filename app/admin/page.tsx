"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import CountUp from "react-countup";
import GameBackground from "@/components/GameBackground";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const adminLinks = [
  {
    title: "Practice Sets",
    description: "Create and manage JLPT/JFT exams and practice sets.",
    href: "/admin/practice-sets",
    icon: "🧱",
    color: "from-blue-600 to-indigo-700",
  },
  {
    title: "Upload Questions",
    description: "Bulk upload questions via CSV.",
    href: "/admin/upload-questions",
    icon: "⬆️",
    color: "from-green-600 to-emerald-700",
  },
  {
    title: "Audio System",
    description: "Upload listening audio files.",
    href: "/admin/audio",
    icon: "🎧",
    color: "from-cyan-600 to-blue-700",
  },
  {
    title: "Question Bank",
    description: "Edit, publish, and manage questions.",
    href: "/admin/questions",
    icon: "❓",
    color: "from-purple-600 to-fuchsia-700",
  },
  {
    title: "Students",
    description: "View students, XP, attempts, and certificates.",
    href: "/admin/students",
    icon: "👨‍🎓",
    color: "from-green-600 to-emerald-700",
  },
  {
    title: "Analytics",
    description: "Track performance and platform growth.",
    href: "/admin/analytics",
    icon: "📈",
    color: "from-blue-600 to-cyan-700",
  },
  {
    title: "Exam Logs",
    description: "Monitor cheating and violations.",
    href: "/admin/exam-logs",
    icon: "🚨",
    color: "from-red-600 to-rose-700",
  },
  {
    title: "AI Import",
    description: "Generate questions using AI.",
    href: "/admin/import-ai",
    icon: "🤖",
    color: "from-indigo-600 to-blue-700",
  },
  {
    title: "Reports",
    description: "Download student reports.",
    href: "/admin/reports",
    icon: "📊",
    color: "from-teal-600 to-cyan-700",
  },
];

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState("");

  async function loadAnalytics() {
    try {
      const res = await fetch("/api/admin/analytics", {
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok) {
        setAnalytics(data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
  }

  useEffect(() => {
    loadAnalytics();

    const interval = setInterval(() => {
      loadAnalytics();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppShell role="admin">
      <div className="game-bg min-h-screen p-6">
        <GameBackground />

        <div className="relative z-10 mx-auto max-w-7xl space-y-8">
          <section className="game-card bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <div className="inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-black text-white">
                  Live Admin Dashboard ⚡
                </div>

                <h1 className="mt-5 text-4xl font-black md:text-6xl">
                  Admin Control Center
                </h1>

                <p className="mt-4 max-w-3xl text-lg text-white">
                  Real-time overview of students, exams, attempts, certificates,
                  questions, and platform growth.
                </p>

                <p className="mt-4 text-sm font-bold text-white">
                  Last updated: {lastUpdated || "Loading..."} · Auto refresh every 10s
                </p>
              </div>

              <div className="rounded-[2rem] bg-white/20 p-6 text-center backdrop-blur pulse-glow">
  <p className="text-sm font-black text-white">Average Score</p>

  <p className="mt-2 text-6xl font-black text-white">
    {analytics?.avgScore ?? 0}%
  </p>

  <div className="mt-4 h-2 w-full rounded-full bg-white/30">
    <div
      className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500"
      style={{ width: `${analytics?.avgScore ?? 0}%` }}
    />
  </div>
</div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/admin/practice-sets" className="game-button px-6 py-4">
                Create Test
              </Link>

              <Link
                href="/admin/questions"
                className="rounded-2xl bg-white px-6 py-4 font-black text-black"
              >
                Manage Questions
              </Link>

              <Link
                href="/admin/analytics"
                className="rounded-2xl bg-black/30 px-6 py-4 font-black text-white"
              >
                Full Analytics
              </Link>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-3 xl:grid-cols-6">
            <Stat title="Users" value={analytics?.totalUsers ?? 0} />
            <Stat title="Students" value={analytics?.totalStudents ?? 0} />
            <Stat title="Questions" value={analytics?.totalQuestions ?? 0} />
            <Stat title="Attempts" value={analytics?.totalAttempts ?? 0} />
            <Stat title="Certificates" value={analytics?.totalCertificates ?? 0} />
            <Stat title="Avg Score" value={`${analytics?.avgScore ?? 0}%`} />
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="game-card p-8 lg:col-span-2">
              <h2 className="text-2xl font-black">Live Score Trend</h2>
              <p className="mt-2 text-gray-700">
                Latest submitted attempts from your database.
              </p>

              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.progress || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="game-card p-8">
              <h2 className="text-2xl font-black">Platform Workflow</h2>

              <div className="mt-6 space-y-4">
                {[
                  "Create Test",
                  "Upload Questions",
                  "Publish Exam",
                  "Students Attempt",
                  "Analyze Results",
                  "Improve Weak Areas",
                ].map((step, i) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-2xl bg-gray-100 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black font-black text-white">
                      {i + 1}
                    </div>
                    <div className="font-bold">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {adminLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="game-card group overflow-hidden transition hover:scale-105"
              >
                <div className={`h-2 bg-gradient-to-r ${item.color}`} />

                <div className="p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
                    {item.icon}
                  </div>

                  <h2 className="mt-5 text-xl font-black">{item.title}</h2>

                  <p className="mt-3 text-gray-700">{item.description}</p>

                  <div className="mt-5 font-black text-blue-600">Open →</div>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ title, value }: any) {
  return (
    <div className="game-card p-6 text-center hover:scale-105 transition pulse-glow">
      <p className="text-sm font-bold text-gray-700">{title}</p>

      <p className="mt-3 text-4xl font-black text-black">
        <CountUp end={Number(value) || 0} duration={1.5} />
      </p>
    </div>
  );
}