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
import { Trophy, Brain } from "lucide-react";

export default function ResultPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const [data, setData] = useState<any>(null);
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    fetch(`/api/results/${params.attemptId}`)
      .then((res) => res.json())
      .then(setData);
  }, [params.attemptId]);

  // ✅ AI EXPLANATION
  async function askAI(answer: any) {
    setAiLoadingId(answer.id);

    const res = await fetch("/api/ai/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: answer.question.text,
        selectedAnswer: answer.selectedChoiceId || "Not answered",
        correctAnswer: answer.question.answer,
        explanation: answer.question.explanation || "",
      }),
    });

    const result = await res.json();

    setAiExplanations((prev) => ({
      ...prev,
      [answer.id]: result.explanation || "AI explanation unavailable.",
    }));

    setAiLoadingId(null);
  }

  // ✅ CERTIFICATE FUNCTION (STEP 24.10)
  async function createCertificate() {
    const res = await fetch("/api/certificates/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ attemptId: params.attemptId }),
    });

    const data = await res.json();

    if (data.success) {
      alert("🎉 Certificate generated successfully!");
      window.location.href = "/student/certificates";
    } else {
      alert(data.error || "Certificate generation failed");
    }
  }

  if (!data?.attempt) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7fff2]">
        <p className="text-2xl font-black">Loading result...</p>
      </main>
    );
  }

  const attempt = data.attempt;

  return (
    <main className="game-bg min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="rounded-[2rem] bg-gradient-to-br from-green-400 to-green-600 p-8 text-white shadow-xl">
          <Trophy size={64} />

          <h1 className="mt-4 text-5xl font-black">Exam Result</h1>

          <p className="mt-2 text-xl text-green-50">
            {attempt.practiceSet.title}
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-4">
            <Card title="Score" value={`${attempt.accuracy || 0}%`} />
            <Card title="Correct" value={attempt.correctCount || 0} />
            <Card title="Questions" value={attempt.totalQuestions || 0} />
            <Card title="Result" value={attempt.resultLabel || "DONE"} />
          </div>
        </div>

        {/* CHART */}
        <div className="mt-8 game-card p-8">
          <h2 className="text-3xl font-black">Category Performance</h2>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryScores || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="accuracy" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ANSWERS */}
        <div className="mt-8 rounded-[2rem] bg-white p-8 shadow-xl">
          <h2 className="flex items-center gap-3 text-3xl font-black">
            <Brain className="text-purple-600" />
            Review Answers
          </h2>

          <div className="mt-6 space-y-5">
            {attempt.answers.map((answer: any, index: number) => (
              <div
                key={answer.id}
                className={`rounded-2xl border p-5 ${
                  answer.isCorrect
                    ? "border-green-300 bg-green-50"
                    : "border-red-300 bg-red-50"
                }`}
              >
                <p className="font-black">Question {index + 1}</p>

                <p className="mt-2 text-lg">{answer.question.text}</p>

                <p className="mt-3">
                  Your answer:{" "}
                  <span className="font-black">
                    {answer.selectedChoiceId || "Not answered"}
                  </span>
                </p>

                <p>
                  Correct answer:{" "}
                  <span className="font-black">{answer.question.answer}</span>
                </p>

                {answer.question.explanation && (
                  <p className="mt-3 rounded-xl bg-white p-4 text-gray-700">
                    {answer.question.explanation}
                  </p>
                )}

                {/* AI BUTTON */}
                <button
                  onClick={() => askAI(answer)}
                  disabled={aiLoadingId === answer.id}
                  className="mt-4 rounded-xl bg-purple-600 px-5 py-3 font-black text-white"
                >
                  {aiLoadingId === answer.id
                    ? "AI explaining..."
                    : "Explain with AI"}
                </button>

                {/* AI RESULT */}
                {aiExplanations[answer.id] && (
                  <div className="mt-4 whitespace-pre-wrap rounded-xl bg-purple-50 p-5 text-gray-800">
                    {aiExplanations[answer.id]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/student/dashboard"
            className="rounded-2xl bg-gray-900 px-6 py-4 font-black text-white"
          >
            Back to Dashboard
          </a>

          <a
            href="/student/wrong-questions"
            className="rounded-2xl bg-green-500 px-6 py-4 font-black text-white"
          >
            Retry Weak Questions
          </a>

          {/* ✅ CERTIFICATE BUTTON */}
          <button
            onClick={createCertificate}
            className="rounded-2xl bg-yellow-500 px-6 py-4 font-black text-white"
          >
            Generate Certificate
          </button>
        </div>
      </div>
    </main>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="rounded-2xl bg-white/20 p-5 backdrop-blur">
      <p className="text-sm font-bold text-green-50">{title}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}