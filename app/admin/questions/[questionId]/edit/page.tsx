"use client";

import { useEffect, useState } from "react";

export default function EditQuestionPage({
  params,
}: {
  params: { questionId: string };
}) {
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/questions/${params.questionId}`)
      .then((res) => res.json())
      .then((data) => setForm(data.question));
  }, [params.questionId]);

  async function save() {
    const res = await fetch(`/api/admin/questions/${params.questionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      alert("Question updated");
      window.location.href = "/admin/questions";
    }
  }

  if (!form) return <p className="p-8">Loading...</p>;

  return (
    <main className="min-h-screen bg-[#f7fff2] p-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-4xl font-black">Edit Question</h1>

        <textarea
          value={form.text || ""}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          className="mt-6 h-40 w-full rounded-xl border p-4"
        />

        <input
          value={form.answer || ""}
          onChange={(e) => setForm({ ...form, answer: e.target.value })}
          placeholder="Correct answer"
          className="mt-4 w-full rounded-xl border p-4"
        />

        <textarea
          value={form.explanation || ""}
          onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          placeholder="Explanation"
          className="mt-4 h-32 w-full rounded-xl border p-4"
        />

        <button
          onClick={save}
          className="mt-6 rounded-xl bg-green-500 px-6 py-4 font-black text-white"
        >
          Save Question
        </button>
      </div>
    </main>
  );
}