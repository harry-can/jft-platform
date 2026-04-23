"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ResultData = {
  id: string;
  totalScore: number | null;
  resultLabel: string | null;
  submittedAt: string | null;
  exam: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  answers: {
    id: string;
    selectedChoiceId: string | null;
    isCorrect: boolean | null;
    question: {
      id: string;
      text: string;
      category: string;
      options: Record<string, string> | null;
      answer: string | null;
    };
  }[];
  categoryBreakdown: Record<
    string,
    {
      total: number;
      correct: number;
    }
  >;
};

export default function ResultPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    fetch(`/api/results/${attemptId}`)
      .then((r) => r.json())
      .then(setResult)
      .catch((err) => console.error("Failed to load result:", err));
  }, [attemptId]);

  if (!result) {
    return <div className="p-6">Loading result...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Exam Result</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-500">Exam</div>
          <div className="text-xl font-bold">{result.exam.title}</div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-500">Total Score</div>
          <div className="text-xl font-bold">{result.totalScore ?? 0}</div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-500">Result</div>
          <div className="text-xl font-bold">{result.resultLabel || "-"}</div>
        </div>
      </div>

      <div className="border rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-3">Category Breakdown</h2>
        <div className="space-y-2">
          {Object.entries(result.categoryBreakdown).map(([category, stats]) => {
            const percent =
              stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : "0.0";

            return (
              <div
                key={category}
                className="flex justify-between border rounded-lg p-3"
              >
                <span>{category}</span>
                <span>
                  {stats.correct}/{stats.total} ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-3">Answers</h2>

        <div className="space-y-4">
          {result.answers.map((a, index) => (
            <div key={a.id} className="border rounded-xl p-4 space-y-2">
              <div className="font-medium">
                Q{index + 1}. {a.question.text}
              </div>

              <div className="text-sm text-gray-500">
                Category: {a.question.category}
              </div>

              {a.question.options &&
                Object.entries(a.question.options).map(([key, value]) => (
                  <div key={key} className="border rounded p-2">
                    {key}. {value}
                  </div>
                ))}

              <div>
                Your Answer: <span className="font-semibold">{a.selectedChoiceId || "-"}</span>
              </div>

              <div>
                Correct Answer: <span className="font-semibold">{a.question.answer || "-"}</span>
              </div>

              <div className={a.isCorrect ? "text-green-600" : "text-red-600"}>
                {a.isCorrect ? "Correct" : "Wrong"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}