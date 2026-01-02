import Image from 'next/image';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0">
        <Image
          src="/assets/icm-logo.svg"
          alt="ICM Logo"
          width={50}
          height={39}
          className="dark:invert"
          priority
        />
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

