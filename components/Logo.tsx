export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
      <div className="flex flex-col">
        <span
          className="text-xl font-bold text-gray-900 dark:text-white leading-tight"
          style={{ fontFamily: 'var(--font-anton), sans-serif' }}
        >
          VoteSecure
        </span>
        <span
          className="text-xs text-gray-500 dark:text-gray-400 leading-tight"
          style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
        >
          Secure Voting Platform
        </span>
      </div>
    </div>
  );
}

