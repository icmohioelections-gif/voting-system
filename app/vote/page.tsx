'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Candidate {
  id: string;
  name: string;
  position: string;
  photo_url: string | null;
  description: string | null;
}

export default function VotePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const voterId = sessionStorage.getItem('voter_id');
    const electionCode = sessionStorage.getItem('election_code');
    
    if (!voterId || !electionCode) {
      router.push('/login');
      return;
    }

    // Verify session with server before allowing access
    fetch('/api/auth/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voter_id: voterId,
        election_code: electionCode,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          // Session invalid or voter already voted
          sessionStorage.removeItem('voter_id');
          sessionStorage.removeItem('election_code');
          if (data.has_voted) {
            router.push('/confirmation');
          } else {
            setError(data.error || 'Session expired. Please log in again.');
            setTimeout(() => router.push('/login'), 2000);
          }
          return null;
        }

        // Session is valid, fetch candidates
        return fetch('/api/candidates');
      })
      .then(async (res) => {
        if (!res) return; // Previous error handled
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setCandidates(data.candidates || []);
        }
      })
      .catch((err) => {
        setError('Failed to load candidates');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    if (!termsAgreed) {
      setError('You must agree to the terms before submitting your vote');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const voterId = sessionStorage.getItem('voter_id');
      const electionCode = sessionStorage.getItem('election_code');

      if (!voterId || !electionCode) {
        throw new Error('Session expired. Please log in again.');
      }

      // Verify session again before submitting vote
      const verifyResponse = await fetch('/api/auth/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voter_id: voterId,
          election_code: electionCode,
        }),
      });

      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok) {
        sessionStorage.removeItem('voter_id');
        sessionStorage.removeItem('election_code');
        if (verifyData.has_voted) {
          router.push('/confirmation');
          return;
        }
        throw new Error(verifyData.error || 'Session expired. Please log in again.');
      }

      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voter_id: voterId,
          election_code: electionCode,
          candidate_id: selectedCandidate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Vote submission failed');
      }

      // Clear session and redirect to confirmation
      sessionStorage.removeItem('voter_id');
      sessionStorage.removeItem('election_code');
      router.push('/confirmation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <main className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'var(--font-anton), sans-serif' }}>
          Cast Your Vote
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8" style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}>
          Please select your preferred candidate
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {candidates.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No candidates available
              </p>
            ) : (
              candidates.map((candidate) => (
                <label
                  key={candidate.id}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCandidate === candidate.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="candidate"
                    value={candidate.id}
                    checked={selectedCandidate === candidate.id}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className="sr-only"
                    disabled={submitting}
                  />
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center flex-shrink-0 ${
                        selectedCandidate === candidate.id
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {selectedCandidate === candidate.id && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    {candidate.photo_url && (
                      <img
                        src={candidate.photo_url}
                        alt={candidate.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white text-lg" style={{ fontFamily: 'var(--font-anton), sans-serif' }}>
                        {candidate.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2" style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}>
                        {candidate.position}
                      </div>
                      {candidate.description && (
                        <div className="text-sm text-gray-700 dark:text-gray-300 mt-2" style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}>
                          {candidate.description}
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <input
              type="checkbox"
              id="terms"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              disabled={submitting}
            />
            <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer" style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}>
              I agree to the terms and conditions. I understand that once I submit my vote, it cannot be edited or changed, and I will not be able to log in again.
            </label>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm" style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !selectedCandidate || !termsAgreed}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
          >
            {submitting ? 'Submitting...' : 'Submit Vote'}
          </button>
        </form>
      </main>
    </div>
  );
}

