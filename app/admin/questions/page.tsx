"use client";

import { useEffect, useState } from "react";

type Question = {
  id: string;
  text: string;
  category: string;
  type: string;
  options: any;
  answer: string | null;
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
    });

    await loadData();
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Admin - Manage Questions</h1>

      <form onSubmit={handleSubmit} className="border rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Create Question</h2>

        <select
          className="border rounded p-2 w-full"
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
          className="border rounded p-2 w-full"
          placeholder="Question text"
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="border rounded p-2"
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
            className="border rounded p-2"
            placeholder="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />
        </div>

        <input
          className="border rounded p-2 w-full"
          placeholder="Option A"
          value={form.optionA}
          onChange={(e) => setForm({ ...form, optionA: e.target.value })}
        />
        <input
          className="border rounded p-2 w-full"
          placeholder="Option B"
          value={form.optionB}
          onChange={(e) => setForm({ ...form, optionB: e.target.value })}
        />
        <input
          className="border rounded p-2 w-full"
          placeholder="Option C"
          value={form.optionC}
          onChange={(e) => setForm({ ...form, optionC: e.target.value })}
        />
        <input
          className="border rounded p-2 w-full"
          placeholder="Option D"
          value={form.optionD}
          onChange={(e) => setForm({ ...form, optionD: e.target.value })}
        />

        <select
          className="border rounded p-2 w-full"
          value={form.answer}
          onChange={(e) => setForm({ ...form, answer: e.target.value })}
        >
          <option value="A">Correct Answer: A</option>
          <option value="B">Correct Answer: B</option>
          <option value="C">Correct Answer: C</option>
          <option value="D">Correct Answer: D</option>
        </select>

        <button
          type="submit"
          className="rounded-xl px-4 py-2 bg-black text-white"
        >
          Create Question
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Question List</h2>

        {loading ? (
          <div>Loading questions...</div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="border rounded-xl p-4 space-y-2">
              <div className="font-medium">{q.text}</div>
              <div className="text-sm text-gray-500">
                Exam: {q.exam.title} | Category: {q.category} | Type: {q.type}
              </div>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(q.options, null, 2)}
              </pre>
              <div className="font-semibold">Correct Answer: {q.answer}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}