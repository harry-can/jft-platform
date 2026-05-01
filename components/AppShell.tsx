
import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const studentNav: NavItem[] = [
  { label: "Home", href: "/student/home", icon: "🏠" },
  { label: "Learn", href: "/learn", icon: "📘" },
  { label: "Practice", href: "/practice", icon: "📝" },
  { label: "Assignments", href: "/student/assignments", icon: "📌" },
  { label: "Report", href: "/student/report", icon: "📊" },
  { label: "Notifications", href: "/notifications", icon: "🔔" },
];

const adminNav: NavItem[] = [
  { label: "Admin Home", href: "/admin", icon: "⚡" },
  { label: "Practice Sets", href: "/admin/practice-sets", icon: "🧱" },
  { label: "Question Bank", href: "/admin/question-bank", icon: "❓" },
  { label: "AI Import", href: "/admin/import-ai", icon: "🤖" },
  { label: "Reports", href: "/admin/reports", icon: "📊" },
  { label: "Classes", href: "/teacher/classes", icon: "🏫" },
  { label: "Calendar", href: "/teacher/calendar", icon: "📅" },
];

const teacherNav: NavItem[] = [
  { label: "Classes", href: "/teacher/classes", icon: "🏫" },
  { label: "Calendar", href: "/teacher/calendar", icon: "📅" },
  { label: "Practice Sets", href: "/admin/practice-sets", icon: "🧱" },
  { label: "Reports", href: "/admin/reports", icon: "📊" },
];

export default function AppShell({
  children,
  role = "student",
}: {
  children: React.ReactNode;
  role?: "student" | "admin" | "teacher";
}) {
  const nav =
    role === "admin" ? adminNav : role === "teacher" ? teacherNav : studentNav;

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white/90 px-5 py-6 backdrop-blur lg:block">
          <Link href="/" className="block">
            <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 to-blue-900 p-5 text-white shadow-xl">
              <div className="text-sm font-bold text-blue-200">JFT / N4</div>
              <div className="mt-1 text-2xl font-black">Exam Platform</div>
              <div className="mt-2 text-xs leading-5 text-slate-300">
                Learn, practice, test, analyze, improve.
              </div>
            </div>
          </Link>

          <nav className="mt-8 space-y-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <section className="flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 px-5 py-4 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between">
              <Link href="/" className="font-black">
                JFT/N4 Platform
              </Link>
              <Link href="/student/home" className="rounded-xl bg-black px-3 py-2 text-sm font-bold text-white">
                Home
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
