
import Link from "next/link";

export default function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
        ✨
      </div>
      <h3 className="mt-5 text-2xl font-black">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-slate-500">{description}</p>

      {href && action && (
        <Link
          href={href}
          className="mt-6 inline-block rounded-2xl bg-black px-5 py-3 font-bold text-white"
        >
          {action}
        </Link>
      )}
    </div>
  );
}
