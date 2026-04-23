"use client";

import { useEffect, useState } from "react";

type Question = {
  id: string;
  text: string;
  category: string;
  type: string;
  options: any;
  answer: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  explanation?: string | null;
  exam: {
    id: string;
    title: string;
  };
};

type Exam = {
  id: string;
  title: string;
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    examId: "",
    text: "",
    category: "VOCAB",
    type: "mcq",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    answer: "A",
    imageUrl: "",
    audioUrl: "",
    explanation: "",
  });

  async function loadData() {
    setLoading(true);
    const [qRes, eRes] = await Promise.all([
      fetch("/api/admin/questions"),
      fetch("/api/exams"),
    ]);

    const qData = await qRes.json();
    const eData = await eRes.json();

    setQuestions(qData);
    setExams(eData);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      examId: form.examId,
      text: form.text,
      category: form.category,
      type: form.type,
      options: {
        A: form.optionA,
        B: form.optionB,
        C: form.optionC,
        D: form.optionD,
      },
      answer: form.answer,
      imageUrl: form.imageUrl,
      audioUrl: form.audioUrl,
      explanation: form.explanation,
    };

    const res = await fetch("/api/admin/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to create question");
      return;
    }

    setForm({
      examId: "",
      text: "",
      category: "VOCAB",
      type: "mcq",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      answer: "A",
      imageUrl: "",
      audioUrl: "",
      explanation: "",
    });

    await loadData();
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Question Manager</h1>
          <p className="mt-2 text-zinc-600">Create text, image, and audio questions.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow lg:col-span-1">
            <h2 className="text-xl font-semibold">Create Question</h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <select
                className="w-full rounded-2xl border p-3"
                value={form.examId}
                onChange={(e) => setForm({ ...form, examId: e.target.value })}
              >
                <option value="">Select Exam</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>

              <textarea
                className="w-full rounded-2xl border p-3"
                placeholder="Question text"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />

              <select
                className="w-full rounded-2xl border p-3"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="VOCAB">VOCAB</option>
                <option value="GRAMMAR">GRAMMAR</option>
                <option value="READING">READING</option>
                <option value="LISTENING">LISTENING</option>
                <option value="INFO">INFO</option>
                <option value="SPEAKING">SPEAKING</option>
                <option value="OTHER">OTHER</option>
              </select>

              <input
                className="w-full rounded-2xl border p-3"
                placeholder="Option A"
                value={form.optionA}
                onChange={(e) => setForm({ ...form, optionA: e.target.value })}
              />
              <input
                className="w-full rounded-2xl border p-3"
                placeholder="Option B"
                value={form.optionB}
                onChange={(e) => setForm({ ...form, optionB: e.target.value })}
              />
              <input
                className="w-full rounded-2xl border p-3"
                placeholder="Option C"
                value={form.optionC}
                onChange={(e) => setForm({ ...form, optionC: e.target.value })}
              />
              <input
                className="w-full rounded-2xl border p-3"
                placeholder="Option D"
                value={form.optionD}
                onChange={(e) => setForm({ ...form, optionD: e.target.value })}
              />

              <select
                className="w-full rounded-2xl border p-3"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
              >
                <option value="A">Correct Answer: A</option>
                <option value="B">Correct Answer: B</option>
                <option value="C">Correct Answer: C</option>
                <option value="D">Correct Answer: D</option>
              </select>

              <input
                className="w-full rounded-2xl border p-3"
                placeholder="Image URL (optional)"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />

              <input
                className="w-full rounded-2xl border p-3"
                placeholder="Audio URL (optional)"
                value={form.audioUrl}
                onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
              />

              <textarea
                className="w-full rounded-2xl border p-3"
                placeholder="Explanation (optional)"
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              />

              <button
                type="submit"
                className="w-full rounded-2xl bg-black px-5 py-3 font-medium text-white transition hover:bg-zinc-800"
              >
                Create Question
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow lg:col-span-2">
            <h2 className="text-xl font-semibold">Question List</h2>

            {loading ? (
              <div className="mt-4">Loading questions...</div>
            ) : (
              <div className="mt-4 space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="rounded-2xl border p-5">
                    <div className="font-medium">{q.text}</div>
                    <div className="mt-1 text-sm text-zinc-500">
                      Exam: {q.exam.title} | Category: {q.category} | Type: {q.type}
                    </div>

                    {q.imageUrl && (
                      <img
                        src={q.imageUrl}
                        alt="Question"
                        className="mt-4 max-h-56 rounded-xl border object-contain"
                      />
                    )}

                    {q.audioUrl && (
                      <audio controls className="mt-4 w-full">
                        <source src={q.audioUrl} />
                      </audio>
                    )}

                    <pre className="mt-3 overflow-auto rounded-xl bg-zinc-100 p-3 text-sm">
                      {JSON.stringify(q.options, null, 2)}
                    </pre>

                    {q.explanation && (
                      <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-zinc-700">
                        {q.explanation}
                      </div>
                    )}

                    <div className="mt-3 font-semibold">Correct Answer: {q.answer}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}