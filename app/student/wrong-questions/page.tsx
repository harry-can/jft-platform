"use client";

import { useEffect, useState } from "react";
import { Brain } from "lucide-react";

export default function WrongQuestionsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/student/wrong-questions")
      .then((res) => res.json())
      .then((data) => setItems(data.wrongAnswers || []));
  }, []);

  return (
    <main className="min-h-screen bg-[#f7fff2] p-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl">
          <h1 className="flex items-center gap-3 text-4xl font-black">
            <Brain className="text-purple-600" />
            Retry Wrong Questions
          </h1>

          <p className="mt-3 text-gray-600">
            Review your mistakes and improve weak areas.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-[2rem] bg-white p-6 shadow">
              <p className="font-black text-red-600">Wrong Question {index + 1}</p>

              <h2 className="mt-3 text-xl font-black">{item.question.text}</h2>

              <p className="mt-3">
                Your answer:{" "}
                <span className="font-black">
                  {item.selectedChoiceId || "Not answered"}
                </span>
              </p>

              <p>
                Correct answer:{" "}
                <span className="font-black">{item.question.answer}</span>
              </p>

              {item.question.explanation && (
                <div className="mt-4 rounded-2xl bg-green-50 p-4">
                  {item.question.explanation}
                </div>
              )}
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow">
              <p className="text-2xl font-black">No wrong questions yet 🎉</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}