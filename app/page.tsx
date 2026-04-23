import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-zinc-200 text-zinc-900">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">JFT Practice Platform</h1>
            <p className="text-sm text-zinc-500">Smart practice, analytics, and mock exams</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/practice"
              className="rounded-xl bg-black px-4 py-2 text-white transition hover:bg-zinc-800"
            >
              Practice
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border px-4 py-2 transition hover:bg-zinc-100"
            >
              Dashboard
            </Link>
            <Link
              href="/teacher/classes"
              className="rounded-xl border px-4 py-2 transition hover:bg-zinc-100"
            >
              Teacher
            </Link>
            <Link
              href="/admin/questions"
              className="rounded-xl border px-4 py-2 transition hover:bg-zinc-100"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <section className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border bg-white px-4 py-2 text-sm text-zinc-600 shadow-sm">
              JFT Basic (N4 Level) Preparation Platform
            </div>

            <h2 className="text-5xl font-bold leading-tight tracking-tight">
              Practice smarter. Track progress. Improve faster.
            </h2>

            <p className="max-w-xl text-lg text-zinc-600">
              Prepare for vocabulary, grammar, reading, and listening with a clean
              dashboard, teacher monitoring, and full mock exam support.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/practice"
                className="rounded-2xl bg-black px-6 py-3 text-lg font-medium text-white shadow-lg transition hover:bg-zinc-800"
              >
                Start Practice
              </Link>

              <Link
                href="/dashboard"
                className="rounded-2xl border bg-white px-6 py-3 text-lg font-medium transition hover:bg-zinc-100"
              >
                Open Dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Today’s Overview</h3>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-600">
                  Live
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-zinc-50 p-4">
                  <div className="text-sm text-zinc-500">Practice Score</div>
                  <div className="mt-2 text-3xl font-bold">82%</div>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-4">
                  <div className="text-sm text-zinc-500">Weak Areas</div>
                  <div className="mt-2 text-3xl font-bold">3</div>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-4">
                  <div className="text-sm text-zinc-500">Mock Exams</div>
                  <div className="mt-2 text-3xl font-bold">5</div>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-4">
                  <div className="text-sm text-zinc-500">Study Streak</div>
                  <div className="mt-2 text-3xl font-bold">12d</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-black p-6 text-white shadow-xl">
              <h3 className="text-lg font-semibold">Recommended Next Step</h3>
              <p className="mt-3 text-zinc-300">
                Focus on grammar and reading for the next session to improve your overall score.
              </p>
              <Link
                href="/practice"
                className="mt-5 inline-block rounded-xl bg-white px-4 py-2 font-medium text-black transition hover:bg-zinc-200"
              >
                Continue Learning
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-md">
            <div className="text-3xl">📘</div>
            <h3 className="mt-4 text-xl font-semibold">Practice Mode</h3>
            <p className="mt-2 text-zinc-600">
              Solve unlimited questions and improve by topic.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-md">
            <div className="text-3xl">📊</div>
            <h3 className="mt-4 text-xl font-semibold">Progress Analytics</h3>
            <p className="mt-2 text-zinc-600">
              Track accuracy, scores, and category-wise weakness.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-md">
            <div className="text-3xl">👨‍🏫</div>
            <h3 className="mt-4 text-xl font-semibold">Teacher Monitoring</h3>
            <p className="mt-2 text-zinc-600">
              View class performance and support students better.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}