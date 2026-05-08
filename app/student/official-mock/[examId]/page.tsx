"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ShieldCheck, Volume2 } from "lucide-react";

export default function OfficialMockExamPage({
  params,
}: {
  params: { examId: string };
}) {
  const examId = params.examId;

  const [exam, setExam] = useState<any>(null);
  const [attemptId, setAttemptId] = useState("");
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [violations, setViolations] = useState(0);
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [audioPlays, setAudioPlays] = useState<Record<string, number>>({});

  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  useEffect(() => {
    fetch(`/api/exams/${examId}`)
      .then((res) => res.json())
      .then((data) => setExam(data.exam));
  }, [examId]);

  async function startExam() {
    const res = await fetch(`/api/exams/${examId}/start`, {
      method: "POST",
    });

    const data = await res.json();

    setAttemptId(data.attemptId);
    setTimeLeft((data.durationMin || 60) * 60);
    setStarted(true);

    await document.documentElement.requestFullscreen();
  }

  async function logViolation(eventType: string, message: string) {
    if (!attemptId || locked) return;

    const res = await fetch("/api/exams/log-violation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ attemptId, eventType, message }),
    });

    const data = await res.json();

    setViolations((prev) => prev + 1);

    if (data.locked) {
      setLocked(true);
      await submitExam(true);
    }
  }

  async function submitExam(autoSubmit = false) {
    const res = await fetch("/api/exams/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ attemptId, answers, autoSubmit }),
    });

    const data = await res.json();

    window.location.href = `/student/result/${attemptId}`;
  }

  useEffect(() => {
    if (!started) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitExam(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, attemptId, answers]);

  useEffect(() => {
    if (!started) return;

    const handleVisibility = () => {
      if (document.hidden) {
        logViolation("TAB_SWITCH", "Student switched tab.");
      }
    };

    const handleBlur = () => {
      logViolation("WINDOW_BLUR", "Student clicked outside exam window.");
    };

    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        logViolation("EXIT_FULLSCREEN", "Student exited fullscreen.");
      }
    };

    const blockContext = (e: MouseEvent) => {
      e.preventDefault();
      logViolation("RIGHT_CLICK", "Student tried right click.");
    };

    const blockKeys = (e: KeyboardEvent) => {
      const blocked =
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey &&
          ["C", "V", "X", "A", "P", "S", "U"].includes(e.key.toUpperCase()));

      if (blocked) {
        e.preventDefault();
        logViolation("BLOCKED_SHORTCUT", `Blocked key: ${e.key}`);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreen);
    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("keydown", blockKeys);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreen);
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", blockKeys);
    };
  }, [started, attemptId, locked]);

  function playAudio(question: any) {
    const limit = question.replayLimit ?? 2;
    const used = audioPlays[question.id] || 0;

    if (used >= limit) return;

    audioRefs.current[question.id]?.play();

    setAudioPlays((prev) => ({
      ...prev,
      [question.id]: used + 1,
    }));
  }

  if (!exam) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7fff2]">
        <p className="text-2xl font-black">Loading exam...</p>
      </main>
    );
  }

  if (!started) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7fff2] p-6">
        <div className="max-w-2xl rounded-[2rem] bg-white p-8 text-center shadow-xl">
          <ShieldCheck className="mx-auto text-green-600" size={72} />

          <h1 className="mt-6 text-4xl font-black">{exam.title}</h1>

          <p className="mt-4 text-gray-600">
            This is a secure official mock exam. Fullscreen is required.
          </p>

          <div className="mt-6 rounded-2xl bg-yellow-50 p-5 text-left text-yellow-800">
            <p className="font-black">Rules:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>No tab switching.</li>
              <li>No right click.</li>
              <li>No copy or paste.</li>
              <li>Listening audio has replay limits.</li>
              <li>Violations are recorded.</li>
            </ul>
          </div>

          <button
            onClick={startExam}
            className="mt-8 rounded-2xl bg-green-500 px-8 py-4 text-xl font-black text-white"
          >
            Start Secure Exam
          </button>
        </div>
      </main>
    );
  }

  if (locked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-red-50">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-xl">
          <AlertTriangle className="mx-auto text-red-600" size={72} />
          <h1 className="mt-6 text-4xl font-black">Exam Locked</h1>
        </div>
      </main>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <main className="min-h-screen bg-[#f7fff2] p-6">
      <div className="mx-auto max-w-6xl">
        <header className="sticky top-0 z-20 mb-6 rounded-[2rem] bg-white p-5 shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black">{exam.title}</h1>
              <p className="text-sm text-gray-500">Secure exam mode</p>
            </div>

            <div className="rounded-2xl bg-gray-900 px-5 py-3 font-black text-white">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </div>

            <div className="rounded-2xl bg-red-100 px-5 py-3 font-black text-red-700">
              Violations: {violations}
            </div>
          </div>
        </header>

        <section className="space-y-6">
          {exam.questions.map((q: any, index: number) => (
            <div key={q.id} className="rounded-[2rem] bg-white p-8 shadow">
              <p className="font-black text-green-600">Question {index + 1}</p>

              <h2 className="mt-3 text-2xl font-black">{q.text}</h2>

              {q.imageUrl && (
                <img
                  src={q.imageUrl}
                  alt="Question image"
                  className="mt-6 max-h-80 rounded-2xl object-contain"
                />
              )}

              {q.audioUrl && (
                <div className="mt-6 rounded-2xl bg-blue-50 p-5">
                  <audio
                    ref={(el) => {
                      audioRefs.current[q.id] = el;
                    }}
                    src={q.audioUrl}
                  />

                  <button
                    onClick={() => playAudio(q)}
                    disabled={(audioPlays[q.id] || 0) >= (q.replayLimit ?? 2)}
                    className="flex items-center gap-2 rounded-2xl bg-blue-500 px-6 py-4 font-black text-white disabled:bg-gray-300"
                  >
                    <Volume2 />
                    Play Audio
                  </button>

                  <p className="mt-3 font-bold text-gray-600">
                    Plays used: {audioPlays[q.id] || 0}/{q.replayLimit ?? 2}
                  </p>
                </div>
              )}

              <div className="mt-6 grid gap-4">
                {(q.options || []).map((option: any) => (
                  <button
                    key={option.id}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: option.id,
                      }))
                    }
                    className={`rounded-2xl border p-5 text-left font-bold ${
                      answers[q.id] === option.id
                        ? "border-green-500 bg-green-50"
                        : "hover:border-green-500"
                    }`}
                  >
                    <span className="mr-3 text-green-600">{option.id}.</span>
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        <button
          onClick={() => submitExam(false)}
          className="mt-8 w-full rounded-2xl bg-green-500 py-5 text-xl font-black text-white"
        >
          Submit Official Exam
        </button>
      </div>
    </main>
  );
}