'use client';

import { useState, useEffect } from 'react';

interface VotingTimerProps {
  votingStartDate: string | null;
  votingPeriodDays: number;
}

export default function VotingTimer({ votingStartDate, votingPeriodDays }: VotingTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!votingStartDate) {
      setTimeRemaining('Not started');
      return;
    }

    const updateTimer = () => {
      const start = new Date(votingStartDate);
      const now = new Date();
      const end = new Date(start.getTime() + votingPeriodDays * 24 * 60 * 60 * 1000);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [votingStartDate, votingPeriodDays]);

  const isExpired = timeRemaining === 'Expired' || timeRemaining === 'Not started';
  const isLow = timeRemaining.includes('h') && parseInt(timeRemaining) < 24;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isExpired
          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          : isLow
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      }`}
    >
      {timeRemaining}
    </span>
  );
}
