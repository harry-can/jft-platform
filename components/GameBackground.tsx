export default function GameBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="floating absolute left-10 top-24 text-6xl opacity-20">
        🎌
      </div>

      <div className="floating absolute right-20 top-40 text-7xl opacity-20">
        ⭐
      </div>

      <div className="floating absolute bottom-24 left-24 text-7xl opacity-20">
        🏯
      </div>

      <div className="floating absolute bottom-32 right-32 text-6xl opacity-20">
        🔥
      </div>
    </div>
  );
}