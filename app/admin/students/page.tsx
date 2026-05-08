"use client";

import { useEffect, useState } from "react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/students")
      .then((res) => res.json())
      .then((data) => setStudents(data.students || []));
  }, []);

  return (
    <main className="min-h-screen bg-[#f7fff2] p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black">Student Management</h1>

        <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4">Student</th>
                <th className="p-4">Email</th>
                <th className="p-4">XP</th>
                <th className="p-4">Streak</th>
                <th className="p-4">Attempts</th>
                <th className="p-4">Certificates</th>
              </tr>
            </thead>

            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="flex items-center gap-3 p-4">
                    <img
                      src={s.avatarUrl || "/images/default-student.png"}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <span className="font-black">{s.name || "Student"}</span>
                  </td>
                  <td className="p-4">{s.email}</td>
                  <td className="p-4">{s.xp}</td>
                  <td className="p-4">{s.streakDays}</td>
                  <td className="p-4">{s.attempts.length}</td>
                  <td className="p-4">{s.certificates.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}