'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ConfirmationPage() {
  const [candidateName, setCandidateName] = useState<string | null>(null);
  const [candidatePosition, setCandidatePosition] = useState<string | null>(null);

  useEffect(() => {
    // Get candidate info from sessionStorage
    const name = sessionStorage.getItem('voted_candidate_name');
    const position = sessionStorage.getItem('voted_candidate_position');
    setCandidateName(name);
    setCandidatePosition(position);
    
    // Clean up after displaying
    setTimeout(() => {
      sessionStorage.removeItem('voted_candidate_name');
      sessionStorage.removeItem('voted_candidate_position');
    }, 5000);
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'var(--font-anton), sans-serif' }}>
            Vote Recorded Successfully!
          </h1>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
            <p className="text-green-800 dark:text-green-200 font-medium mb-3" style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}>
              ✓ Your vote has been recorded and will be counted.
            </p>
            
            {candidateName && (
              <div className="mt-4 pt-4 border-t border-green-300 dark:border-green-700">
                <p className="text-sm text-green-700 dark:text-green-300 mb-2" style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}>
                  You voted for:
                </p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100" style={{ fontFamily: 'var(--font-anton), sans-serif' }}>
                  {candidateName}
                </p>
                {candidatePosition && (
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1" style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}>
                    {candidatePosition}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-blue-800 dark:text-blue-200 font-medium mb-2" style={{ fontFamily: 'var(--font-anton), sans-serif' }}>
              Stay Tuned
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300" style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}>
              The election results will be announced soon. Thank you for participating in the democratic process!
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
        >
          ← Back to Home Page
        </Link>
      </main>
    </div>
  );
}

