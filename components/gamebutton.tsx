export default function GameButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`game-button px-6 py-4 ${className}`}
    >
      {children}
    </button>
  );
}