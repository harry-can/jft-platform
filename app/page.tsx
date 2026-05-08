import Link from "next/link";
import GameBackground from "@/components/GameBackground";

export default function Home() {
  return (
    <main className="game-bg min-h-screen p-6">
      <GameBackground />

      <div className="relative z-10 mx-auto max-w-7xl">
        <nav className="flex items-center justify-between py-6">
          <div>
            <h1 className="neon-title text-4xl font-black">JFT Master</h1>
            <p className="font-bold text-slate-600">
              Practice • Exam • Analytics • AI
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-2xl bg-white px-6 py-3 font-black text-slate-900 shadow"
            >
              Login
            </Link>

            <Link href="/register" className="game-button px-6 py-3">
              Register
            </Link>
          </div>
        </nav>

        <section className="grid min-h-[75vh] items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-flex rounded-full bg-white/80 px-5 py-2 font-black text-green-700 shadow">
              🎮 JLPT + JFT Duolingo-Style Platform
            </div>

            <h2 className="neon-title mt-6 text-5xl font-black leading-tight md:text-7xl">
              Learn Japanese like a game.
            </h2>

            <p className="mt-6 max-w-2xl text-xl font-bold leading-9 text-slate-700">
              Take practice tests, official mock exams, audio listening tests,
              track weaknesses, retry wrong answers, earn XP, and unlock
              certificates.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/login" className="game-button px-8 py-5">
                Start Learning
              </Link>

              <Link
                href="/exams"
                className="rounded-2xl bg-slate-950 px-8 py-5 font-black text-white shadow-xl"
              >
                Take Mock Exam
              </Link>
            </div>
          </div>

          <div className="game-card floating p-6">
            <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
              <h3 className="text-2xl font-black">Student Performance</h3>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Stat label="Accuracy" value="84%" />
                <Stat label="Weak Areas" value="3" />
                <Stat label="Mock Exams" value="12" />
                <Stat label="Study Streak" value="18d" />
              </div>

              <div className="mt-6 rounded-2xl bg-green-400/20 p-5">
                <p className="font-black text-green-300">AI Recommendation</p>
                <p className="mt-2 text-green-50">
                  Focus on Grammar and Listening today. Retry wrong questions
                  until mastery.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 pb-16 md:grid-cols-3">
          {[
            ["📘", "Smart Practice", "Category-wise JFT/JLPT practice."],
            ["🎧", "Real Audio Tests", "Listening questions with replay limits."],
            ["📊", "Analytics", "Weakness tracking and progress charts."],
          ].map(([icon, title, desc]) => (
            <div key={title} className="game-card p-8">
              <div className="text-5xl">{icon}</div>
              <h3 className="mt-5 text-2xl font-black">{title}</h3>
              <p className="mt-3 font-semibold text-slate-600">{desc}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  );
}