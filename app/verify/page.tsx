'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VerifyPage() {
  const [electionCode, setElectionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [voterInfo, setVoterInfo] = useState<{ name: string; hasVoted: boolean } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setVoterInfo(null);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ election_code: electionCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      if (data.has_voted) {
        setError('This voter has already voted.');
        setVoterInfo({
          name: `${data.first_name} ${data.last_name || ''}`.trim(),
          hasVoted: true,
        });
      } else {
        setSuccess(true);
        setVoterInfo({
          name: `${data.first_name} ${data.last_name || ''}`.trim(),
          hasVoted: false,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsVoted = async () => {
    if (!success || !voterInfo) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mark-voted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ election_code: electionCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark as voted');
      }

      setSuccess(false);
      setVoterInfo(null);
      setElectionCode('');
      alert('Voter marked as voted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <main className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          In-Person Verification
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Enter election code to verify voter
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label
              htmlFor="election-code"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Election Code
            </label>
            <input
              id="election-code"
              type="text"
              value={electionCode}
              onChange={(e) => setElectionCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter election code"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {success && voterInfo && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-medium mb-2">
              ✓ Voter Verified: {voterInfo.name}
            </p>
            <p className="text-green-700 dark:text-green-300 text-sm mb-4">
              This voter has not voted yet and is eligible to vote.
            </p>
            <button
              onClick={handleMarkAsVoted}
              disabled={loading}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Mark as Voted'}
            </button>
          </div>
        )}

        {voterInfo && voterInfo.hasVoted && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              Voter: {voterInfo.name} - Already voted
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}

