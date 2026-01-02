import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <main className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'var(--font-anton), sans-serif' }}>
            Thank You for Voting!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6" style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}>
            Thank you for voting.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-green-800 dark:text-green-200 font-medium" style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}>
              The results will be announced soon.
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
        >
          Return to Home
        </Link>
      </main>
    </div>
  );
}

