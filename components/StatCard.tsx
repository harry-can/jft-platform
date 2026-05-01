
export default function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-slate-500">{title}</div>
          <div className="mt-3 text-4xl font-black tracking-tight">{value}</div>
          {subtitle && <div className="mt-2 text-sm text-slate-500">{subtitle}</div>}
        </div>

        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
