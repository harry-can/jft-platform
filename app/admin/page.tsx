
import Link from "next/link";
import AppShell from "@/components/AppShell";

const adminLinks = [
  {
    title: "Practice Set Builder",
    description: "Create official exams, full tests, category practice, drafts, and published sets.",
    href: "/admin/practice-sets",
    icon: "🧱",
    color: "from-blue-600 to-indigo-700",
  },
  {
    title: "Question Bank",
    description: "Add, edit, duplicate, publish, unpublish, and manage questions.",
    href: "/admin/question-bank",
    icon: "❓",
    color: "from-purple-600 to-fuchsia-700",
  },
  {
    title: "AI / PDF Import",
    description: "Generate draft sets from prompts or text content, then review before publishing.",
    href: "/admin/import-ai",
    icon: "🤖",
    color: "from-cyan-600 to-blue-700",
  },
  {
    title: "Student Reports",
    description: "View individual student analysis, weakness, attempts, and question history.",
    href: "/admin/reports",
    icon: "📊",
    color: "from-green-600 to-emerald-700",
  },
  {
    title: "Classes",
    description: "Create classes, add students, assign work, and monitor class results.",
    href: "/teacher/classes",
    icon: "🏫",
    color: "from-orange-500 to-red-600",
  },
  {
    title: "Assignment Calendar",
    description: "Track scheduled, upcoming, overdue, active, and completed assignments.",
    href: "/teacher/calendar",
    icon: "📅",
    color: "from-slate-700 to-slate-950",
  },
  {
    title: "Export Reports",
    description: "Download student performance reports as CSV.",
    href: "/admin/export",
    icon: "⬇️",
    color: "from-teal-600 to-cyan-700",
  },
  {
    title: "Audit Logs",
    description: "Track admin activity, imports, exports, publishing, and user changes.",
    href: "/admin/audit",
    icon: "🛡️",
    color: "from-rose-600 to-pink-700",
  },
];

export default function AdminPage() {
  return (
    <AppShell role="admin">
      <section className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-2xl">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-blue-200">
              Admin Control Center
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
              Manage your entire JFT/N4 platform.
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Control students, teachers, classes, question banks, official exams,
              AI imports, reports, exports, assignments, and analytics.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/admin/practice-sets"
                className="rounded-2xl bg-white px-6 py-4 font-black text-slate-950"
              >
                Create Test
              </Link>

              <Link
                href="/admin/question-bank"
                className="rounded-2xl border border-white/20 px-6 py-4 font-black"
              >
                Manage Questions
              </Link>

              <Link
                href="/teacher/classes"
                className="rounded-2xl border border-white/20 px-6 py-4 font-black"
              >
                Manage Classes
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur">
            <div className="text-sm font-bold text-blue-200">Platform Workflow</div>
            <div className="mt-5 space-y-3">
              {[
                "Create Set",
                "Add Questions",
                "Review Quality",
                "Publish",
                "Assign",
                "Analyze Results",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                    {index + 1}
                  </div>
                  <div className="font-bold">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {adminLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group overflow-hidden rounded-[2rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className={`h-2 bg-gradient-to-r ${item.color}`} />
            <div className="p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl transition group-hover:scale-110">
                {item.icon}
              </div>

              <h2 className="mt-5 text-xl font-black">{item.title}</h2>
              <p className="mt-3 min-h-20 leading-7 text-slate-500">
                {item.description}
              </p>

              <div className="mt-5 font-black text-blue-700">Open →</div>
            </div>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
