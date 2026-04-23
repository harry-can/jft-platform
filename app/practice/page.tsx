"use client";

import { useEffect, useState } from "react";

type Question = {
  id: string;
  text: string;
  options: Record<string, string> | null;
  answer: string | null;
  category: string;
  type: string;
};

export default function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    fetch("/api/practice")
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data);
      })
      .catch((err) => {
        console.error("Failed to load practice questions:", err);
      });
  }, []);

  const handleSelect = (questionId: string, choiceKey: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceKey,
    }));
  };

  const calculateScore = () => {
    let score = 0;

    for (const q of questions) {
      if (answers[q.id] === q.answer) {
        score++;
      }
    }

    return score;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Practice Mode</h1>

      {questions.length === 0 ? (
        <div>Loading questions...</div>
      ) : (
        <>
          {questions.map((q, index) => (
            <div key={q.id} className="border rounded-xl p-4 space-y-3">
              <div className="font-medium">
                Q{index + 1}. {q.text}
              </div>

              {q.options &&
                Object.entries(q.options).map(([key, value]) => (
                  <label
                    key={key}
                    className="block border rounded p-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={key}
                      className="mr-2"
                      checked={answers[q.id] === key}
                      onChange={() => handleSelect(q.id, key)}
                    />
                    <span>
                      {key}. {value}
                    </span>
                  </label>
                ))}

              {showResult && (
                <div className="pt-2">
                  {answers[q.id] === q.answer ? (
                    <div className="text-green-600 font-semibold">Correct</div>
                  ) : (
                    <div className="text-red-600 font-semibold">
                      Wrong — Correct answer: {q.answer}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-4">
            <button
              onClick={() => setShowResult(true)}
              className="px-6 py-3 bg-black text-white rounded-xl"
            >
              Submit Practice
            </button>

            {showResult && (
              <div className="px-6 py-3 border rounded-xl font-semibold">
                Score: {calculateScore()} / {questions.length}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}