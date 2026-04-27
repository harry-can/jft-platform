
import Link from "next/link";

const adminLinks = [
  {
    title: "Practice Set Builder",
    description: "Create, edit, publish, and manage official exams and practice sets.",
    href: "/admin/practice-sets",
    icon: "🧱",
  },
  {
  title: "Assignment Calendar",
  description: "View scheduled, upcoming, overdue, and completed class assignments.",
  href: "/teacher/calendar",
  icon: "📅",
},
  {
    title: "Question Bank",
    description: "Add, edit, duplicate, publish, unpublish, and delete questions.",
    href: "/admin/question-bank",
    icon: "❓",
  },
  {
    title: "AI / PDF Import",
    description: "Generate draft practice sets from prompt, PDF, or text file.",
    href: "/admin/import-ai",
    icon: "🤖",
  },
  {
    title: "Student Reports",
    description: "View all students, scores, weaknesses, and question-level history.",
    href: "/admin/reports",
    icon: "📊",
  },
  {
    title: "Export Reports",
    description: "Download student report data as CSV.",
    href: "/admin/export",
    icon: "⬇️",
  },
  {
    title: "Audit Logs",
    description: "Track admin actions, imports, exports, publishing, and updates.",
    href: "/admin/audit",
    icon: "🛡️",
  },
  {
    title: "Classes",
    description: "Manage teacher classes, join codes, students, and assignments.",
    href: "/teacher/classes",
    icon: "🏫",
  },
  {
    title: "Student Home Preview",
    description: "Open the smart student learning loop dashboard.",
    href: "/student/home",
    icon: "🎯",
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[2rem] bg-black p-8 text-white shadow-xl">
          <p className="font-bold text-blue-300">Admin Dashboard</p>
          <h1 className="mt-2 text-4xl font-black">JFT / N4 Platform Control Center</h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Manage students, teachers, practice sets, official exams, AI imports,
            reports, exports, and platform activity.
          </p>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[2rem] bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="text-5xl">{item.icon}</div>
              <h2 className="mt-5 text-2xl font-black text-slate-950">
                {item.title}
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                {item.description}
              </p>
            </Link>
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow">
          <h2 className="text-2xl font-black">Recommended Admin Workflow</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-5">
            {[
              "Create Set",
              "Add Questions",
              "Review",
              "Publish",
              "Analyze Reports",
            ].map((step, index) => (
              <div key={step} className="rounded-2xl bg-slate-50 p-4 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-black text-white">
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
