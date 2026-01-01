'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Candidate {
  id: string;
  name: string;
  position: string;
}

interface Voter {
  id: string;
  election_code: string;
  first_name: string;
  last_name: string | null;
  has_voted: boolean;
  voted_at: string | null;
}

interface ResultItem {
  candidate: Candidate;
  count: number;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'results' | 'voters' | 'candidates' | 'sync'>('results');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [statistics, setStatistics] = useState<{
    total_voters: number;
    votes_cast: number;
    turnout_percentage: string;
  } | null>(null);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [syncMessage, setSyncMessage] = useState('');

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/results');
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
        setStatistics(data.statistics);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoters = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/voters');
      const data = await res.json();
      if (data.voters) {
        setVoters(data.voters);
      }
    } catch (err) {
      console.error('Error fetching voters:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/candidates');
      const data = await res.json();
      if (data.candidates) {
        setCandidates(data.candidates);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/admin/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(`✓ ${data.message}`);
        fetchVoters();
      } else {
        setSyncMessage(`✗ Error: ${data.error}`);
      }
    } catch {
      setSyncMessage('✗ Sync failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'results') fetchResults();
    if (activeTab === 'voters') fetchVoters();
    if (activeTab === 'candidates') fetchCandidates();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Admin Dashboard
          </h1>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              {(['results', 'voters', 'candidates', 'sync'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div>
              {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 dark:text-blue-400">Total Voters</div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {statistics.total_voters}
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-sm text-green-600 dark:text-green-400">Votes Cast</div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {statistics.votes_cast}
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 dark:text-purple-400">Turnout</div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {statistics.turnout_percentage}%
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : results.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No votes cast yet</div>
                ) : (
                  results.map((item, index) => (
                    <div
                      key={item.candidate.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {item.candidate.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.candidate.position}
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {item.count}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Voters Tab */}
          {activeTab === 'voters' && (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Election Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Voted At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : voters.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          No voters found
                        </td>
                      </tr>
                    ) : (
                      voters.map((voter) => (
                        <tr key={voter.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                            {voter.election_code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {voter.first_name} {voter.last_name || ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                voter.has_voted
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {voter.has_voted ? 'Voted' : 'Not Voted'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {voter.voted_at
                              ? new Date(voter.voted_at).toLocaleString()
                              : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Candidates Tab */}
          {activeTab === 'candidates' && (
            <div>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No candidates</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {candidate.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {candidate.position}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sync Tab */}
          {activeTab === 'sync' && (
            <div>
              <div className="max-w-md">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Sync voter data from Google Sheets to Supabase database.
                </p>
                <button
                  onClick={handleSync}
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Syncing...' : 'Sync from Google Sheets'}
                </button>
                {syncMessage && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm">{syncMessage}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

