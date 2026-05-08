export default function GameCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`game-card shine p-6 ${className}`}>
      {children}
    </div>
  );
}