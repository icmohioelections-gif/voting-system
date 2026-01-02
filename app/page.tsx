'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-16">
      <main className="w-full max-w-5xl">
        <div 
          className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-16 border border-gray-100 dark:border-gray-700 transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex flex-col items-center mb-12">
            <div className={`transition-all duration-700 delay-100 ${mounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
              <Logo className="mb-8" />
            </div>
            <p 
              className={`text-center text-gray-600 dark:text-gray-300 mb-12 text-lg transition-all duration-700 delay-200 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
            >
              Secure and auditable voting platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-8">
            {/* In-Person Verification */}
            <Link
              href="/verify"
              className={`group block p-8 border-2 border-blue-200 dark:border-blue-800 rounded-2xl hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:scale-[1.02] transform relative overflow-hidden ${
                mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" style={{ fontFamily: 'var(--font-anton), sans-serif' }}>
                  In-Person Verification
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed" style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}>
                  For election committee members to verify voters in person
                </p>
              </div>
            </Link>

            {/* Online Voting */}
            <Link
              href="/login"
              className={`group block p-8 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/20 dark:to-purple-800/20 hover:scale-[1.02] transform relative overflow-hidden ${
                mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors" style={{ fontFamily: 'var(--font-anton), sans-serif' }}>
                  Online Voting
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed" style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}>
                  Cast your vote securely using your election code
                </p>
              </div>
            </Link>
          </div>

          <div className={`mt-12 text-center transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <Link
              href="/admin/results"
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
              style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
            >
              <span>Admin Dashboard</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
