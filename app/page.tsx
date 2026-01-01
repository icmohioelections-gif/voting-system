import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="w-full max-w-4xl px-4 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Voting System
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
            Secure and auditable voting platform
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* In-Person Verification */}
            <Link
              href="/verify"
              className="block p-6 border-2 border-blue-200 dark:border-blue-800 rounded-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-lg bg-blue-50 dark:bg-blue-900/20"
            >
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                In-Person Verification
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                For election committee members to verify voters in person
              </p>
            </Link>

            {/* Online Voting */}
            <Link
              href="/login"
              className="block p-6 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-lg bg-indigo-50 dark:bg-indigo-900/20"
            >
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Online Voting
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Cast your vote securely using your election code
              </p>
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/admin"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Admin Dashboard →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
