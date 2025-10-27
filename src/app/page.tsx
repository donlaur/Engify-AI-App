export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl text-center">
        <h1 className="mb-6 text-6xl font-bold tracking-tight text-gray-900">
          Engify.ai
        </h1>
        <p className="mb-8 text-2xl text-gray-600">
          AI Adoption Education Platform
        </p>
        <p className="mb-12 text-lg text-gray-500">
          Learn prompt engineering and AI best practices through curated
          templates and learning pathways
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/login"
            className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition hover:bg-blue-700"
          >
            Get Started
          </a>
          <a
            href="/prompts"
            className="rounded-lg border-2 border-blue-600 px-8 py-3 text-lg font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Browse Prompts
          </a>
        </div>
      </div>
    </div>
  );
}
