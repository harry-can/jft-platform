
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Question = {
  id: string;
  text: string;
  options: Record<string, string> | null;
  answer: string | null;
  explanation: string | null;
  category: string;
  retryCount?: number;
};

export default function WrongRetryPage() {
  const params = useParams();
  const router = useRouter();
  const retrySetId = params.retrySetId as string;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [practiceSetId, setPracticeSetId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/wrong-retry/${retrySetId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load wrong questions");

        setQuestions(data.questions || []);
        setPracticeSetId(data.practiceSetId);
      })
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  }, [retrySetId]);

  async function submit() {
    setSubmitting(true);

    const res = await fetch("/api/practice/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answers,
        practiceSetId,
        retrySetId,
        attemptType: "WRONG_RETRY",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to submit");
      setSubmitting(false);
      return;
    }

    if (data.completedWrongRetry) {
      alert("Great! You solved all wrong questions. 100% complete.");
      router.push(`/results/${data.attemptId}`);
      return;
    }

    alert(`${data.unresolvedWrongCount} wrong question(s) remaining. Practice again.`);
    window.location.reload();
  }

  if (loading) return <div className="p-6">Loading wrong questions...</div>;

  if (questions.length === 0) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow">
          <h1 className="text-3xl font-black">Wrong Retry Complete</h1>
          <p className="mt-3 text-slate-600">You have solved all wrong questions.</p>
          <button
            onClick={() => router.push("/student/report")}
            className="mt-6 rounded-2xl bg-black px-5 py-3 font-bold text-white"
          >
            View Report
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow">
          <p className="font-bold text-blue-700">Recursive Weakness Practice</p>
          <h1 className="mt-2 text-4xl font-black">Practice Only Wrong Questions</h1>
          <p className="mt-3 text-slate-600">
            Correct answers disappear. Wrong answers stay until you reach 100%.
          </p>
        </div>

        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="rounded-3xl bg-white p-6 shadow">
              <div className="text-sm font-bold text-slate-500">
                Question {index + 1} - {q.category} - Retried {q.retryCount || 0} times
              </div>

              <h2 className="mt-3 text-xl font-black">{q.text}</h2>

              <div className="mt-5 space-y-3">
                {q.options &&
                  Object.entries(q.options).map(([key, value]) => (
                    <label
                      key={key}
                      className={`block cursor-pointer rounded-2xl border p-4 ${
                        answers[q.id] === key ? "border-black bg-slate-50" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        className="mr-3"
                        name={q.id}
                        checked={answers[q.id] === key}
                        onChange={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [q.id]: key,
                          }))
                        }
                      />
                      <b>{key}.</b> {value}
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <button
          disabled={submitting || Object.keys(answers).length !== questions.length}
          onClick={submit}
          className="mt-8 rounded-2xl bg-black px-6 py-3 font-bold text-white disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Wrong Practice"}
        </button>
      </div>
    </main>
  );
}
