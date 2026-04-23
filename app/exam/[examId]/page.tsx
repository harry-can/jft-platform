"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Question = {
  id: string;
  text: string;
  options: Record<string, string> | null;
  answer: string | null;
  category: string;
  type: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  explanation?: string | null;
};

type Exam = {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
};

type Attempt = {
  id: string;
  examId: string;
  userId: string;
};

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      const examRes = await fetch(`/api/exams/${examId}`);
      const examData = await examRes.json();
      setExam(examData);

      const attemptRes = await fetch(`/api/exams/${examId}/start`, {
        method: "POST",
      });
      const attemptData = await attemptRes.json();
      setAttempt(attemptData);

      setLoading(false);
    }

    init().catch((err) => {
      console.error("Failed to start exam:", err);
      setLoading(false);
    });
  }, [examId]);

  async function handleSelect(questionId: string, choiceKey: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceKey,
    }));

    if (!attempt) return;

    await fetch(`/api/attempts/${attempt.id}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId,
        selectedChoiceId: choiceKey,
        timeSpentSec: 0,
        flagged: false,
      }),
    });
  }

  async function handleFinish() {
    if (!attempt) return;

    setSubmitting(true);

    const res = await fetch(`/api/attempts/${attempt.id}/finish`, {
      method: "POST",
    });

    if (!res.ok) {
      alert("Failed to finish exam");
      setSubmitting(false);
      return;
    }

    router.push(`/results/${attempt.id}`);
  }

  if (loading) return <div className="p-6">Loading exam...</div>;
  if (!exam) return <div className="p-6">Exam not found.</div>;

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-3xl font-bold">{exam.title}</h1>
        <p className="mt-2 text-zinc-600">{exam.description}</p>

        <div className="mt-8 space-y-6">
          {exam.questions.map((q, index) => (
            <div key={q.id} className="rounded-3xl bg-white p-6 shadow">
              <div className="mb-4">
                <div className="text-sm text-zinc-500">Question {index + 1}</div>
                <div className="mt-2 text-lg font-semibold">{q.text}</div>
              </div>

              {q.imageUrl && (
                <img
                  src={q.imageUrl}
                  alt="Question"
                  className="mb-4 max-h-64 rounded-2xl border object-contain"
                />
              )}

              {q.audioUrl && (
                <audio controls className="mb-4 w-full">
                  <source src={q.audioUrl} />
                </audio>
              )}

              <div className="space-y-3">
                {q.options &&
                  Object.entries(q.options).map(([key, value]) => (
                    <label
                      key={key}
                      className={`block cursor-pointer rounded-2xl border p-4 transition ${
                        answers[q.id] === key
                          ? "border-black bg-zinc-50"
                          : "hover:bg-zinc-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={key}
                        className="mr-3"
                        checked={answers[q.id] === key}
                        onChange={() => handleSelect(q.id, key)}
                      />
                      <span className="font-medium">{key}.</span> {value}
                    </label>
                  ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleFinish}
            disabled={submitting}
            className="rounded-2xl bg-black px-6 py-3 font-medium text-white transition hover:bg-zinc-800"
          >
            {submitting ? "Submitting..." : "Finish Exam"}
          </button>
        </div>
      </div>
    </div>
  );
}