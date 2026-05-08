export default function GameLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <main className="game-bg flex min-h-screen items-center justify-center p-6">
      <div className="game-card pulse-glow p-10 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-5xl shadow-xl floating">
          🎌
        </div>

        <h1 className="neon-title mt-6 text-4xl font-black">{text}</h1>

        <div className="mx-auto mt-6 h-3 w-72 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-green-400 to-blue-500" />
        </div>
      </div>
    </main>
  );
}