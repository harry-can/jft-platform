export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 bg-white shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold">JFT Practice Platform</h1>

        <div className="flex gap-4">
          <a
            href="/practice"
            className="px-4 py-2 text-sm bg-black text-white rounded-lg"
          >
            Practice
          </a>

          <a
            href="/admin/questions"
            className="px-4 py-2 text-sm border rounded-lg"
          >
            Admin
          </a>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-4xl w-full text-center space-y-8">
          <h2 className="text-4xl font-bold">
            Prepare for JFT Basic (N4 Level)
          </h2>

          <p className="text-gray-600 text-lg">
            Practice vocabulary, grammar, reading, and listening. Track your
            progress and identify your weak areas.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/practice"
              className="px-8 py-3 bg-black text-white rounded-xl text-lg"
            >
              Start Practice
            </a>

            <a
              href="/teacher/classes"
              className="px-8 py-3 border rounded-xl text-lg"
            >
              Teacher Dashboard
            </a>

            <a
              href="/admin/questions"
              className="px-8 py-3 border rounded-xl text-lg"
            >
              Manage Questions
            </a>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="p-6 bg-white rounded-2xl shadow">
              <h3 className="font-semibold text-lg mb-2">📘 Practice Mode</h3>
              <p className="text-sm text-gray-600">
                Solve unlimited questions and improve your Japanese skills.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow">
              <h3 className="font-semibold text-lg mb-2">📊 Analytics</h3>
              <p className="text-sm text-gray-600">
                Track accuracy, scores, and weak areas.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow">
              <h3 className="font-semibold text-lg mb-2">👨‍🏫 Teacher Panel</h3>
              <p className="text-sm text-gray-600">
                Monitor student performance and progress.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} JFT Practice Platform
      </footer>
    </div>
  );
}