"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Weakness = {
  id: string;
  category: string;
  accuracy: number;
  weaknessLevel: string | null;
};

type Attempt = {
  id: string;
  totalScore: number | null;
  resultLabel: string | null;
  startedAt: string;
};

type StudentAnalytics = {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  latestAttempt: Attempt | null;
  attemptsCount: number;
  averageScore: number;
  weaknesses: Weakness[];
};

export default function TeacherClassPage() {
  const params = useParams();
  const classId = params.classId as string;

  const [data, setData] = useState<StudentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/classes/${classId}/analytics`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Failed to load class analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, [classId]);

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch(`/api/teacher/classes/${classId}/members/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to add student");
      return;
    }

    setUserId("");
    await loadAnalytics();
  }

  if (loading) {
    return <div className="p-6">Loading class analytics...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Teacher Class Analytics</h1>

      <form onSubmit={handleAddStudent} className="border rounded-2xl p-5 space-y-4">
        <h2 className="text-xl font-semibold">Add Student to Class</h2>

        <input
          className="border rounded-lg p-3 w-full"
          placeholder="Student User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <button
          type="submit"
          className="px-5 py-3 bg-black text-white rounded-xl"
        >
          Add Student
        </button>
      </form>

      {data.length === 0 ? (
        <div className="border rounded-xl p-4">No students found in this class.</div>
      ) : (
        data.map((student) => (
          <div key={student.id} className="border rounded-2xl p-5 space-y-3">
            <div>
              <div className="text-xl font-semibold">
                {student.user.name || "No Name"}
              </div>
              <div className="text-sm text-gray-500">{student.user.email}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-xl p-3">
                <div className="text-sm text-gray-500">Attempts</div>
                <div className="text-xl font-bold">{student.attemptsCount}</div>
              </div>

              <div className="border rounded-xl p-3">
                <div className="text-sm text-gray-500">Average Score</div>
                <div className="text-xl font-bold">{student.averageScore}</div>
              </div>

              <div className="border rounded-xl p-3">
                <div className="text-sm text-gray-500">Latest Result</div>
                <div className="text-xl font-bold">
                  {student.latestAttempt?.resultLabel || "No attempts yet"}
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-2">Weaknesses</h2>
              {student.weaknesses.length === 0 ? (
                <div className="text-sm text-gray-500">No weakness data yet.</div>
              ) : (
                <div className="space-y-2">
                  {student.weaknesses.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <span>{w.category}</span>
                      <span>
                        {w.accuracy.toFixed(1)}% - {w.weaknessLevel || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}