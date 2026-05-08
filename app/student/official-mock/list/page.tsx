"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Clock, FileText } from "lucide-react";

export default function OfficialMockListPage() {
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/exams/official")
      .then((res) => res.json())
      .then((data) => setExams(data.exams || []));
  }, []);

  return (
    <main className="min-h-screen bg-[#f7fff2] p-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] bg-gradient-to-br from-green-400 to-green-600 p-8 text-white shadow-xl">
          <ShieldCheck size={56} />

          <h1 className="mt-4 text-5xl font-black">
            Official JLPT / JFT Mock Exams
          </h1>

          <p className="mt-3 max-w-2xl text-green-50">
            Take secure mock exams with timer, audio limits, tab tracking, and result analytics.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="rounded-[2rem] bg-white p-6 shadow-xl"
            >
              <h2 className="text-2xl font-black">{exam.title}</h2>

              <p className="mt-2 text-gray-600">
                {exam.description || "Official secure mock exam"}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-green-50 p-4">
                  <Clock className="text-green-600" />
                  <p className="mt-2 font-black">{exam.timeLimitMin} min</p>
                </div>

                <div className="rounded-2xl bg-blue-50 p-4">
                  <FileText className="text-blue-600" />
                  <p className="mt-2 font-black">{exam.totalQuestions} questions</p>
                </div>
              </div>

              <a
                href={`/student/official-mock/${exam.id}`}
                className="mt-6 block rounded-2xl bg-green-500 py-4 text-center font-black text-white"
              >
                Start Secure Exam
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}