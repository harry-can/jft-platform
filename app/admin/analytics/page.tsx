"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p className="p-8">Loading analytics...</p>;

  return (
    <main className="min-h-screen bg-[#f7fff2] p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black">Analytic Dashboard</h1>

        <div className="mt-8 grid gap-5 md:grid-cols-3 lg:grid-cols-6">
          <Card title="Users" value={data.totalUsers} />
          <Card title="Students" value={data.totalStudents} />
          <Card title="Questions" value={data.totalQuestions} />
          <Card title="Attempts" value={data.totalAttempts} />
          <Card title="Certificates" value={data.totalCertificates} />
          <Card title="Avg Score" value={`${data.avgScore}%`} />
        </div>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow">
          <h2 className="text-2xl font-black">Recent Score Trend</h2>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.progress || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <p className="text-sm font-bold text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}