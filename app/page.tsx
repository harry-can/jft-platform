import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">
            JFT Master
          </h1>
          <p className="text-sm text-slate-500">Practice • Exam • Analytics</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-2xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
          >
            Register
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            Official-style JFT Basic Preparation
          </div>

          <h2 className="max-w-3xl text-5xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
            Learn Japanese smarter with practice, exams and progress tracking.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A complete platform for students, teachers and admins with category
            practice, official mock exams, audio/image questions, reports and
            weakness analysis.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/practice"
              className="rounded-2xl bg-blue-600 px-7 py-4 font-bold text-white shadow-xl shadow-blue-600/25 hover:bg-blue-700"
            >
              Start Practice
            </Link>

            <Link
              href="/exams"
              className="rounded-2xl border border-slate-200 bg-white px-7 py-4 font-bold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Take Mock Exam
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-300/40 backdrop-blur">
          <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Student Performance</h3>
              <span className="rounded-full bg-green-400/20 px-3 py-1 text-sm text-green-300">
                Live
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm text-slate-300">Accuracy</p>
                <p className="mt-2 text-4xl font-black">84%</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm text-slate-300">Weak Areas</p>
                <p className="mt-2 text-4xl font-black">3</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm text-slate-300">Mock Exams</p>
                <p className="mt-2 text-4xl font-black">12</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm text-slate-300">Study Streak</p>
                <p className="mt-2 text-4xl font-black">18d</p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] bg-blue-50 p-6">
            <h4 className="font-bold text-blue-900">AI Recommendation</h4>
            <p className="mt-2 text-sm leading-6 text-blue-800">
              Focus on Grammar and Listening today. Retry wrong questions until
              all answers become correct.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-16 md:grid-cols-3">
        {[
          ["📘", "Smart Practice", "Category-wise and full practice sets."],
          ["🎧", "Audio/Image Questions", "Support for official-style media questions."],
          ["📊", "Detailed Reports", "Teacher and admin analytics for each student."],
        ].map(([icon, title, desc]) => (
          <div
            key={title}
            className="rounded-[2rem] border border-white bg-white/85 p-8 shadow-xl shadow-slate-300/30 backdrop-blur"
          >
            <div className="text-4xl">{icon}</div>
            <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
            <p className="mt-3 leading-7 text-slate-600">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}