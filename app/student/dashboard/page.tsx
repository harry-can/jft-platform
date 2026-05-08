"use client";

import { useEffect, useState } from "react";
import { Flame, Trophy, Brain, Headphones, ShieldCheck } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <main className="game-bg min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <section className="game-card overflow-hidden bg-gradient-to-br from-lime-300 via-emerald-300 to-cyan-300 p-8">
  <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
    <div>
      <div className="inline-flex rounded-full bg-white/70 px-5 py-2 text-sm font-black text-green-700 shadow">
        🎮 JLPT + JFT Gaming Academy
      </div>

      <h1 className="neon-title mt-6 text-5xl font-black leading-tight md:text-7xl">
        Welcome, {data?.name || "Student"} ⚡
      </h1>

      <p className="mt-5 max-w-2xl text-lg font-bold text-slate-700">
        Learn Japanese like a game. Earn XP, unlock badges, defeat weak areas,
        and clear official mock exams.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <a href="/student/official-mock/list" className="game-button px-7 py-4">
          Start Boss Exam
        </a>

        <a
          href="/student/wrong-questions"
          className="rounded-2xl bg-slate-950 px-7 py-4 font-black text-white shadow-xl"
        >
          Fix Weakness
        </a>
      </div>

      <div className="mt-8 max-w-md">
        <div className="mb-2 flex justify-between text-sm font-black text-slate-700">
          <span>XP Progress</span>
          <span>{data?.xp || 0} XP</span>
        </div>
        <div className="xp-bar">
          <div
            className="xp-fill"
            style={{ width: `${Math.min(((data?.xp || 0) % 1000) / 10, 100)}%` }}
          />
        </div>
      </div>
    </div>

    <div className="floating rounded-[2rem] bg-white/40 p-5 shadow-2xl backdrop-blur">
      <img
        src={data?.imageUrl || "/images/default-student.png"}
        alt="Student"
        className="h-80 w-full rounded-[2rem] object-cover"
      />
    </div>
  </div>
</section>

        <section className="mt-8 grid gap-5 md:grid-cols-4">
          <Card icon={<Flame />} title="Streak" value={`${data?.streak || 0} days`} />
          <Card icon={<Trophy />} title="XP" value={data?.xp || 0} />
          <Card icon={<Brain />} title="Level" value={data?.level || "N5"} />
          <Card icon={<ShieldCheck />} title="Exam Mode" value="Secure" />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-6 shadow lg:col-span-2">
            <h2 className="text-2xl font-black">Progress Graph</h2>

            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.progress || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" strokeWidth={4} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow">
            <h2 className="text-2xl font-black">Start Learning</h2>

            <div className="mt-6 space-y-4">
              <a href="/student/test" className="block rounded-2xl bg-[#58CC02] p-5 font-black text-white">
                Practice Test
              </a>

              <a href="/student/audio-test" className="block rounded-2xl bg-blue-500 p-5 font-black text-white">
                <Headphones className="inline mr-2" />
                Listening Test
              </a>

              <a href="/student/official-mock/list" className="block rounded-2xl bg-gray-900 p-5 font-black text-white">
                Official Mock Exam
              </a>
              <a
  href="/student/profile"
  className="block rounded-2xl bg-blue-500 p-5 font-black text-white"
>
  My Profile
</a>

<a
  href="/student/official-mock/list"
  className="block rounded-2xl bg-gray-900 p-5 font-black text-white"
>
  Official Mock Exam
</a>

<a
  href="/student/certificates"
  className="block rounded-2xl bg-yellow-500 p-5 font-black text-white"
>
  My Certificates
</a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ icon, title, value }: any) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
        {icon}
      </div>
      <p className="mt-4 text-sm font-bold text-gray-500">{title}</p>
      <p className="mt-1 text-3xl font-black text-gray-900">{value}</p>
    </div>
  );
}