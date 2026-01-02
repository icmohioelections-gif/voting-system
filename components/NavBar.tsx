'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Logo from './Logo';

export default function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [voterName, setVoterName] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      const voterId = sessionStorage.getItem('voter_id');
      const electionCode = sessionStorage.getItem('election_code');
      const sessionExpiry = sessionStorage.getItem('session_expiry');

      if (voterId && electionCode && sessionExpiry) {
        const expiryTime = parseInt(sessionExpiry);
        const now = Date.now();

        if (now < expiryTime) {
          setIsLoggedIn(true);
          // Fetch voter name
          try {
            const res = await fetch('/api/auth/verify-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ voter_id: voterId, election_code: electionCode }),
            });
            const data = await res.json();
            if (data.valid) {
              const firstName = sessionStorage.getItem('voter_first_name');
              const lastName = sessionStorage.getItem('voter_last_name');
              if (firstName) {
                setVoterName(`${firstName} ${lastName || ''}`.trim());
              }
              // Calculate time remaining
              setTimeRemaining(Math.max(0, Math.floor((expiryTime - now) / 1000)));
            } else {
              handleLogout();
            }
          } catch (error) {
            handleLogout();
          }
        } else {
          handleLogout();
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update time remaining every second
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const handleLogout = () => {
    const voterId = sessionStorage.getItem('voter_id');
    const electionCode = sessionStorage.getItem('election_code');

    if (voterId && electionCode) {
      // Notify server to end session
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_id: voterId, election_code: electionCode }),
      }).catch(() => {}); // Ignore errors
    }

    sessionStorage.clear();
    setIsLoggedIn(false);
    setVoterName('');
    setTimeRemaining(null);
    
    if (!isAdminPage) {
      router.push('/login');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span
                      className="text-sm font-medium text-green-800 dark:text-green-200"
                      style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
                    >
                      Logged in as {voterName}
                    </span>
                  </div>
                  {timeRemaining !== null && timeRemaining > 0 && (
                    <span
                      className="text-xs text-green-600 dark:text-green-400"
                      style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
                    >
                      ({formatTime(timeRemaining)} remaining)
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
                >
                  Logout
                </button>
              </>
            ) : (
              !isAdminPage && (
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
                >
                  Login
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

