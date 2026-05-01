
export default function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    PUBLISHED: "bg-green-100 text-green-700",
    DRAFT: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    OVERDUE: "bg-red-100 text-red-700",
    READY: "bg-blue-100 text-blue-700",
    ACTIVE: "bg-blue-100 text-blue-700",
    SCHEDULED: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}
