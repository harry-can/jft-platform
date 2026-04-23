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

  if (loading) {
    return <div className="p-6">Loading exam...</div>;
  }

  if (!exam) {
    return <div className="p-6">Exam not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{exam.title}</h1>
      <p className="text-gray-600">{exam.description}</p>

      {exam.questions.map((q, index) => (
        <div key={q.id} className="border rounded-xl p-4 space-y-3">
          <div className="font-medium">
            Q{index + 1}. {q.text}
          </div>

          {q.options &&
            Object.entries(q.options).map(([key, value]) => (
              <label key={key} className="block border rounded p-3 cursor-pointer">
                <input
                  type="radio"
                  name={q.id}
                  value={key}
                  className="mr-2"
                  checked={answers[q.id] === key}
                  onChange={() => handleSelect(q.id, key)}
                />
                {key}. {value}
              </label>
            ))}
        </div>
      ))}

      <button
        onClick={handleFinish}
        disabled={submitting}
        className="px-6 py-3 bg-black text-white rounded-xl"
      >
        {submitting ? "Submitting..." : "Finish Exam"}
      </button>
    </div>
  );
}