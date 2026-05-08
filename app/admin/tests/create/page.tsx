"use client";

import { useState } from "react";

export default function CreateTestSetPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    examType: "JLPT",
    level: "N5",
    durationMin: 60,
    isOfficial: false,
  });

  async function submit() {
    const res = await fetch("/api/admin/tests/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(`Created Test Set ID: ${data.id}`);
  }

  return (
    <main className="min-h-screen bg-[#f7fff2] p-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-xl">
        <h1 className="text-4xl font-black">Create JLPT / JFT Test Set</h1>

        <div className="mt-8 space-y-4">
          <input
            placeholder="Test title"
            className="w-full rounded-2xl border p-4"
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            placeholder="Description"
            className="w-full rounded-2xl border p-4"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <select
            className="w-full rounded-2xl border p-4"
            onChange={(e) => setForm({ ...form, examType: e.target.value })}
          >
            <option value="JLPT">JLPT</option>
            <option value="JFT">JFT</option>
          </select>

          <select
            className="w-full rounded-2xl border p-4"
            onChange={(e) => setForm({ ...form, level: e.target.value })}
          >
            <option value="N5">JLPT N5</option>
            <option value="N4">JLPT N4</option>
            <option value="N3">JLPT N3</option>
            <option value="N2">JLPT N2</option>
            <option value="N1">JLPT N1</option>
            <option value="JFT_BASIC">JFT Basic</option>
          </select>

          <input
            type="number"
            placeholder="Duration minutes"
            className="w-full rounded-2xl border p-4"
            onChange={(e) =>
              setForm({ ...form, durationMin: Number(e.target.value) })
            }
          />

          <label className="flex items-center gap-3 font-bold">
            <input
              type="checkbox"
              onChange={(e) =>
                setForm({ ...form, isOfficial: e.target.checked })
              }
            />
            Official secure mock exam
          </label>

          <button
            onClick={submit}
            className="w-full rounded-2xl bg-green-500 py-4 font-black text-white"
          >
            Create Test Set
          </button>
        </div>
      </div>
    </main>
  );
}