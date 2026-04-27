
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Question = {
  id: string;
  text: string;
  category: string;
  difficulty: string;
  type: string;
  options: Record<string, string> | null;
  answer?: string | null;
  explanation?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  transcript?: string | null;
  replayLimit?: number | null;
};

type PracticeSet = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  category?: string | null;
  timeLimitMin?: number | null;
};

type Attempt = {
  id: string;
  practiceSetId: string;
  type: string;
};

export default function TestEnginePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode") || "FULL";
  const category = searchParams.get("category") || "";
  const setId = searchParams.get("setId") || "";
  const retrySetId = searchParams.get("retrySetId") || "";

  const [loading, setLoading] = useState(true);
  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [startedAt] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [audioReplayCount, setAudioReplayCount] = useState<Record<string, number>>({});

  const isOfficial = mode === "OFFICIAL_EXAM";

  useEffect(() => {
    async function start() {
      setLoading(true);

      const res = await fetch("/api/practice/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          category: category || undefined,
          setId: setId || undefined,
          retrySetId: retrySetId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to start practice");
        router.push("/student/home");
        return;
      }

      setAttempt(data.attempt);
      setPracticeSet(data.practiceSet || null);
      setQuestions(data.questions || []);

      const limitMin = data.practiceSet?.timeLimitMin || (mode === "OFFICIAL_EXAM" ? 60 : null);
      if (limitMin) {
        setTimeLeft(limitMin * 60);
      }

      setLoading(false);
    }

    start();
  }, [mode, category, setId, retrySetId, router]);

  useEffect(() => {
    if (timeLeft === null || loading || submitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;

        if (prev <= 1) {
          clearInterval(timer);
          submit(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, submitting]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  function formatTime(seconds: number | null) {
    if (seconds === null) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function selectAnswer(questionId: string, key: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: key,
    }));
  }

  function toggleFlag(questionId: string) {
    setFlagged((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  }

  function handleAudioPlay(question: Question, event: React.SyntheticEvent<HTMLAudioElement>) {
    const limit = question.replayLimit || practiceSet?.timeLimitMin ? question.replayLimit : null;

    if (!limit) return;

    const currentCount = audioReplayCount[question.id] || 0;

    if (currentCount >= limit) {
      event.currentTarget.pause();
      alert(`Replay limit reached for this audio. Limit: ${limit}`);
      return;
    }

    setAudioReplayCount((prev) => ({
      ...prev,
      [question.id]: currentCount + 1,
    }));
  }

  async function submit(autoSubmitted = false) {
    if (!attempt || submitting) return;

    if (!autoSubmitted && answeredCount < questions.length) {
      const ok = confirm(
        `You answered ${answeredCount}/${questions.length}. Submit anyway?`
      );

      if (!ok) return;
    }

    setSubmitting(true);

    const res = await fetch("/api/practice/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answers,
        practiceSetId: attempt.practiceSetId,
        retrySetId: retrySetId || undefined,
        attemptType: retrySetId ? "WRONG_RETRY" : attempt.type,
        autoSubmitted,
        timeSpentSec: Math.floor((Date.now() - startedAt) / 1000),
        flagged,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to submit");
      setSubmitting(false);
      return;
    }

    if (data.completedWrongRetry) {
      alert("Great! You completed all wrong questions.");
      router.push(`/results/${data.attemptId}`);
      return;
    }

    if (data.shouldRetryWrong && data.wrongRetrySetId) {
      const goRetry = confirm(
        `You scored ${data.accuracy}%. Wrong-question practice is ready. Practice wrong questions now?`
      );

      if (goRetry) {
        router.push(`/wrong-retry/${data.wrongRetrySetId}`);
        return;
      }
    }

    router.push(`/results/${data.attemptId}`);
  }

  if (loading) {
    return <div className="p-6">Loading test engine...</div>;
  }

  if (!attempt || questions.length === 0) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow">
          <h1 className="text-3xl font-black">No questions found</h1>
          <p className="mt-3 text-slate-600">
            Please ask admin to publish a practice set for this mode.
          </p>
          <button
            onClick={() => router.push("/student/home")}
            className="mt-6 rounded-2xl bg-black px-5 py-3 font-bold text-white"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold text-blue-700">
              {retrySetId ? "Wrong Retry" : isOfficial ? "Official Exam" : "Practice"}
            </p>
            <h1 className="text-2xl font-black">
              {practiceSet?.title || "Wrong Question Practice"}
            </h1>
            <p className="text-sm text-slate-500">
              Answered {answeredCount}/{questions.length}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <div
                className={`rounded-2xl px-5 py-3 font-black ${
                  timeLeft < 300 ? "bg-red-100 text-red-700" : "bg-slate-100"
                }`}
              >
                {formatTime(timeLeft)}
              </div>
            )}

            <button
              onClick={() => submit(false)}
              disabled={submitting}
              className="rounded-2xl bg-black px-6 py-3 font-bold text-white disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_280px]">
        <section className="space-y-6">
          {questions.map((q, index) => (
            <div
              key={q.id}
              id={`q-${index + 1}`}
              className={`rounded-3xl bg-white p-6 shadow ${
                flagged[q.id] ? "ring-2 ring-yellow-400" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-500">
                    Question {index + 1} · {q.category} · {q.difficulty}
                  </div>
                  <h2 className="mt-3 text-xl font-black leading-8">{q.text}</h2>
                </div>

                <button
                  onClick={() => toggleFlag(q.id)}
                  className="rounded-xl border px-4 py-2 text-sm font-bold"
                >
                  {flagged[q.id] ? "Unflag" : "Flag"}
                </button>
              </div>

              {q.imageUrl && (
                <img
                  src={q.imageUrl}
                  alt="Question image"
                  className="mt-5 max-h-80 rounded-2xl border object-contain"
                />
              )}

              {q.audioUrl && (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <audio
                    controls
                    className="w-full"
                    onPlay={(event) => handleAudioPlay(q, event)}
                  >
                    <source src={q.audioUrl} />
                  </audio>

                  {q.replayLimit && (
                    <p className="mt-2 text-sm text-slate-500">
                      Replay: {audioReplayCount[q.id] || 0}/{q.replayLimit}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-5 space-y-3">
                {q.options &&
                  Object.entries(q.options).map(([key, value]) => (
                    <label
                      key={key}
                      className={`block cursor-pointer rounded-2xl border p-4 transition ${
                        answers[q.id] === key
                          ? "border-black bg-slate-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={key}
                        checked={answers[q.id] === key}
                        onChange={() => selectAnswer(q.id, key)}
                        className="mr-3"
                      />
                      <span className="font-black">{key}.</span> {value}
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </section>

        <aside className="h-fit rounded-3xl bg-white p-5 shadow lg:sticky lg:top-28">
          <h2 className="text-xl font-black">Question Map</h2>

          <div className="mt-5 grid grid-cols-5 gap-2">
            {questions.map((q, index) => (
              <a
                key={q.id}
                href={`#q-${index + 1}`}
                className={`flex h-10 items-center justify-center rounded-xl text-sm font-black ${
                  answers[q.id]
                    ? "bg-black text-white"
                    : flagged[q.id]
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {index + 1}
              </a>
            ))}
          </div>

          <div className="mt-6 space-y-2 text-sm text-slate-600">
            <div>Black = answered</div>
            <div>Yellow = flagged</div>
            <div>Gray = unanswered</div>
          </div>

          <button
            onClick={() => submit(false)}
            disabled={submitting}
            className="mt-6 w-full rounded-2xl bg-black px-5 py-3 font-bold text-white disabled:opacity-50"
          >
            Submit Test
          </button>
        </aside>
      </div>
    </main>
  );
}
