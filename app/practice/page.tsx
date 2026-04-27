
import Link from "next/link";

const categories = [
  {
    title: "Vocabulary",
    category: "VOCAB",
    description: "Practice N4 words, meanings, and usage.",
    icon: "📘",
  },
  {
    title: "Grammar",
    category: "GRAMMAR",
    description: "Practice N4 grammar patterns and sentence forms.",
    icon: "🧩",
  },
  {
    title: "Kanji",
    category: "KANJI",
    description: "Practice N4 kanji readings, meanings, and words.",
    icon: "漢",
  },
  {
    title: "Reading",
    category: "READING",
    description: "Practice notices, short passages, and practical reading.",
    icon: "📖",
  },
  {
    title: "Listening",
    category: "LISTENING",
    description: "Practice audio questions and real-life listening.",
    icon: "🎧",
  },
  {
    title: "Information",
    category: "INFO",
    description: "Practice schedules, signs, announcements, and forms.",
    icon: "ℹ️",
  },
];

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow">
          <p className="font-bold text-blue-700">Practice Center</p>
          <h1 className="mt-2 text-4xl font-black">Choose Practice Mode</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Practice by category, take a full practice test, or continue improving your weak areas.
          </p>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <Link
            href="/test-engine?mode=FULL"
            className="rounded-[2rem] bg-white p-7 shadow transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="text-5xl">📝</div>
            <h2 className="mt-5 text-2xl font-black">Full Practice Test</h2>
            <p className="mt-3 text-slate-600">
              Mixed N4 practice from all sections.
            </p>
          </Link>

          <Link
            href="/test-engine?mode=OFFICIAL_EXAM"
            className="rounded-[2rem] bg-black p-7 text-white shadow transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="text-5xl">🏆</div>
            <h2 className="mt-5 text-2xl font-black">Official Mock Exam</h2>
            <p className="mt-3 text-slate-300">
              Timed official-style test with full analysis.
            </p>
          </Link>

          <Link
            href="/student/report"
            className="rounded-[2rem] bg-white p-7 shadow transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="text-5xl">🎯</div>
            <h2 className="mt-5 text-2xl font-black">Weakness Practice</h2>
            <p className="mt-3 text-slate-600">
              Continue pending wrong-question retry sets.
            </p>
          </Link>
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-black">Category Practice</h2>
          <p className="mt-2 text-slate-600">
            Select one section and improve it directly.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {categories.map((item) => (
              <Link
                key={item.category}
                href={`/test-engine?mode=CATEGORY&category=${item.category}`}
                className="rounded-[2rem] bg-white p-7 shadow transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="text-5xl">{item.icon}</div>
                <h3 className="mt-5 text-2xl font-black">{item.title}</h3>
                <p className="mt-3 text-slate-600">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] bg-white p-8 shadow">
          <h2 className="text-3xl font-black">Recommended Flow</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-7">
            {[
              "Learn",
              "Practice",
              "Test",
              "Analyze",
              "Retry",
              "Improve",
              "Retest",
            ].map((step, index) => (
              <div key={step} className="rounded-2xl bg-slate-50 p-4 text-center">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-black text-white">
                  {index + 1}
                </div>
                <div className="mt-3 font-black">{step}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
