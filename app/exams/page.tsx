
import Link from "next/link";

export default function ExamsPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow">
          <p className="font-bold text-blue-700">Official Style Testing</p>
          <h1 className="mt-2 text-4xl font-black">JFT / JLPT N4 Mock Exams</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Take a timed official-style exam. Your score, category performance, weakness, and wrong-question retry set will be created automatically.
          </p>

          <Link
            href="/test-engine?mode=OFFICIAL_EXAM"
            className="mt-8 inline-block rounded-2xl bg-black px-7 py-4 font-black text-white"
          >
            Start Latest Official Mock Exam
          </Link>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <InfoCard
            title="Timed Test"
            description="Official exams use a countdown timer and auto-submit when time ends."
          />

          <InfoCard
            title="Full Analysis"
            description="After submitting, students get score, accuracy, result label, and weakness report."
          />

          <InfoCard
            title="Wrong Retry"
            description="If students score 50% or more, only wrong questions are regenerated for retry."
          />
        </section>
      </div>
    </main>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow">
      <h2 className="text-xl font-black">{title}</h2>
      <p className="mt-3 text-slate-600">{description}</p>
    </div>
  );
}
