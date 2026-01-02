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
  const [activeTab, setActiveTab] = useState<'results' | 'voters' | 'candidates' | 'sync' | 'settings'>('results');
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
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvMessage, setCsvMessage] = useState('');
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidatePosition, setNewCandidatePosition] = useState('');
  const [newCandidatePhoto, setNewCandidatePhoto] = useState('');
  const [newCandidateDescription, setNewCandidateDescription] = useState('');
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [candidateMessage, setCandidateMessage] = useState('');
  const [newVoterFirstName, setNewVoterFirstName] = useState('');
  const [newVoterLastName, setNewVoterLastName] = useState('');
  const [newVoterElectionCode, setNewVoterElectionCode] = useState('');
  const [addingVoter, setAddingVoter] = useState(false);
  const [voterMessage, setVoterMessage] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [syncingSheet, setSyncingSheet] = useState(false);
  const [sheetSyncMessage, setSheetSyncMessage] = useState('');
  const [resettingDb, setResettingDb] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

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

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    // Find column indices
    const electionCodeIdx = headers.findIndex(h => h === 'election_code' || h === 'electioncode' || h === 'code');
    const firstNameIdx = headers.findIndex(h => h === 'first_name' || h === 'firstname' || h === 'first');
    const lastNameIdx = headers.findIndex(h => h === 'last_name' || h === 'lastname' || h === 'last');

    if (electionCodeIdx === -1 || firstNameIdx === -1) {
      throw new Error('CSV must have election_code and first_name columns');
    }

    // Parse rows
    const voters: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values[electionCodeIdx] && values[firstNameIdx]) {
        voters.push({
          election_code: values[electionCodeIdx],
          first_name: values[firstNameIdx],
          last_name: lastNameIdx !== -1 ? values[lastNameIdx] : null,
        });
      }
    }

    return voters;
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      setCsvMessage('✗ Please select a CSV file');
      return;
    }

    setCsvUploading(true);
    setCsvMessage('');

    try {
      const text = await csvFile.text();
      const voters = parseCSV(text);

      if (voters.length === 0) {
        setCsvMessage('✗ No valid voters found in CSV file');
        setCsvUploading(false);
        return;
      }

      const res = await fetch('/api/admin/upload-voters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voters }),
      });

      const data = await res.json();

      if (data.success) {
        setCsvMessage(`✓ ${data.message}`);
        setCsvFile(null);
        fetchVoters();
      } else {
        setCsvMessage(`✗ Error: ${data.error}${data.errors ? '\n' + data.errors.join('\n') : ''}`);
      }
    } catch (error) {
      setCsvMessage(`✗ Error: ${error instanceof Error ? error.message : 'Failed to process CSV'}`);
    } finally {
      setCsvUploading(false);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCandidateName.trim() || !newCandidatePosition.trim()) {
      setCandidateMessage('✗ Name and position are required');
      return;
    }

    setAddingCandidate(true);
    setCandidateMessage('');

    try {
      const res = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCandidateName.trim(),
          position: newCandidatePosition.trim(),
          photo_url: newCandidatePhoto.trim() || null,
          description: newCandidateDescription.trim() || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCandidateMessage(`✓ ${data.message}`);
        setNewCandidateName('');
        setNewCandidatePosition('');
        setNewCandidatePhoto('');
        setNewCandidateDescription('');
        fetchCandidates();
      } else {
        setCandidateMessage(`✗ Error: ${data.error || 'Failed to add candidate'}`);
      }
    } catch (error) {
      setCandidateMessage(`✗ Error: ${error instanceof Error ? error.message : 'Failed to add candidate'}`);
    } finally {
      setAddingCandidate(false);
    }
  };

  const handleAddVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newVoterFirstName.trim() || !newVoterElectionCode.trim()) {
      setVoterMessage('✗ First name and election code are required');
      return;
    }

    // Validate 10-digit alphanumeric code
    const codePattern = /^[A-Za-z0-9]{10}$/;
    if (!codePattern.test(newVoterElectionCode.trim())) {
      setVoterMessage('✗ Election code must be exactly 10 alphanumeric characters');
      return;
    }

    setAddingVoter(true);
    setVoterMessage('');

    try {
      const res = await fetch('/api/admin/add-voter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: newVoterFirstName.trim(),
          last_name: newVoterLastName.trim() || null,
          election_code: newVoterElectionCode.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setVoterMessage(`✓ ${data.message}`);
        setNewVoterFirstName('');
        setNewVoterLastName('');
        setNewVoterElectionCode('');
        fetchVoters();
      } else {
        setVoterMessage(`✗ Error: ${data.error || 'Failed to add voter'}`);
      }
    } catch (error) {
      setVoterMessage(`✗ Error: ${error instanceof Error ? error.message : 'Failed to add voter'}`);
    } finally {
      setAddingVoter(false);
    }
  };

  const handleSyncSheetUrl = async () => {
    if (!sheetUrl.trim()) {
      setSheetSyncMessage('✗ Please enter a Google Sheet URL');
      return;
    }

    setSyncingSheet(true);
    setSheetSyncMessage('');

    try {
      const res = await fetch('/api/admin/sync-sheet-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet_url: sheetUrl.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setSheetSyncMessage(`✓ ${data.message}`);
        setSheetUrl('');
        fetchVoters();
      } else {
        setSheetSyncMessage(`✗ Error: ${data.error}${data.details ? '\n' + data.details : ''}`);
      }
    } catch (error) {
      setSheetSyncMessage(`✗ Error: ${error instanceof Error ? error.message : 'Failed to sync sheet'}`);
    } finally {
      setSyncingSheet(false);
    }
  };

  const handleResetDb = async () => {
    if (!confirm('Are you sure you want to delete ALL data? This will remove all votes, voters, and candidates. This action cannot be undone.')) {
      return;
    }

    if (!confirm('This is your last warning. Are you absolutely sure?')) {
      return;
    }

    setResettingDb(true);
    setResetMessage('');

    try {
      const res = await fetch('/api/admin/reset-db', {
        method: 'POST',
      });

      const data = await res.json();

      if (data.success) {
        setResetMessage(`✓ ${data.message}`);
        // Refresh all data
        fetchResults();
        fetchVoters();
        fetchCandidates();
      } else {
        setResetMessage(`✗ Error: ${data.error}${data.details ? '\n' + data.details : ''}`);
      }
    } catch (error) {
      setResetMessage(`✗ Error: ${error instanceof Error ? error.message : 'Failed to reset database'}`);
    } finally {
      setResettingDb(false);
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
              {(['results', 'voters', 'candidates', 'sync', 'settings'] as const).map((tab) => (
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
                  (() => {
                    const maxVotes = Math.max(...results.map(r => r.count), 1);
                    return results.map((item, index) => {
                      const percentage = (item.count / maxVotes) * 100;
                      return (
                        <div
                          key={item.candidate.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
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
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </div>
          )}

          {/* Voters Tab */}
          {activeTab === 'voters' && (
            <div className="space-y-6">
              {/* Add Voter Form */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Add New Voter
                </h2>
                <form onSubmit={handleAddVoter} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={newVoterFirstName}
                        onChange={(e) => setNewVoterFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        disabled={addingVoter}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name (optional)
                      </label>
                      <input
                        type="text"
                        value={newVoterLastName}
                        onChange={(e) => setNewVoterLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        disabled={addingVoter}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Unique Election Code (10 alphanumeric) *
                      </label>
                      <input
                        type="text"
                        value={newVoterElectionCode}
                        onChange={(e) => setNewVoterElectionCode(e.target.value.toUpperCase())}
                        placeholder="ABC123XYZ7"
                        pattern="[A-Za-z0-9]{10}"
                        maxLength={10}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                        disabled={addingVoter}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={addingVoter}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingVoter ? 'Adding...' : 'Add Voter'}
                  </button>
                  {voterMessage && (
                    <div className={`p-4 rounded-lg whitespace-pre-wrap ${
                      voterMessage.startsWith('✓') 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                    }`}>
                      <p className="text-sm">{voterMessage}</p>
                    </div>
                  )}
                </form>
              </div>

              {/* Voters List */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  All Voters ({voters.length})
                </h2>
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
            </div>
          )}

          {/* Candidates Tab */}
          {activeTab === 'candidates' && (
            <div className="space-y-6">
              {/* Add Candidate Form */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Add New Candidate
                </h2>
                <form onSubmit={handleAddCandidate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Candidate Name *
                      </label>
                      <input
                        type="text"
                        value={newCandidateName}
                        onChange={(e) => setNewCandidateName(e.target.value)}
                        placeholder="e.g., John Doe"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        disabled={addingCandidate}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Position *
                      </label>
                      <input
                        type="text"
                        value={newCandidatePosition}
                        onChange={(e) => setNewCandidatePosition(e.target.value)}
                        placeholder="e.g., President, Vice President"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        disabled={addingCandidate}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Photo URL (optional)
                    </label>
                    <input
                      type="url"
                      value={newCandidatePhoto}
                      onChange={(e) => setNewCandidatePhoto(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={addingCandidate}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Short Description (optional)
                    </label>
                    <textarea
                      value={newCandidateDescription}
                      onChange={(e) => setNewCandidateDescription(e.target.value)}
                      placeholder="Brief description about the candidate"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={addingCandidate}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={addingCandidate}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingCandidate ? 'Adding...' : 'Add Candidate'}
                  </button>
                  {candidateMessage && (
                    <div className={`p-4 rounded-lg whitespace-pre-wrap ${
                      candidateMessage.startsWith('✓') 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                    }`}>
                      <p className="text-sm">{candidateMessage}</p>
                    </div>
                  )}
                </form>
              </div>

              {/* Candidates List */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Current Candidates ({candidates.length})
                </h2>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : candidates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    No candidates added yet. Use the form above to add candidates.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {candidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
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
            </div>
          )}

          {/* Sync Tab */}
          {activeTab === 'sync' && (
            <div className="space-y-8">
              {/* CSV Upload Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Upload Voters via CSV
                </h2>
                <div className="max-w-2xl">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Upload a CSV file with voter data. Required columns: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">election_code</code>, <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">first_name</code> (optional: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">last_name</code>)
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CSV File
                      </label>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100
                          dark:file:bg-indigo-900/20 dark:file:text-indigo-300"
                      />
                    </div>
                    <button
                      onClick={handleCSVUpload}
                      disabled={csvUploading || !csvFile}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {csvUploading ? 'Uploading...' : 'Upload CSV'}
                    </button>
                    {csvMessage && (
                      <div className={`mt-4 p-4 rounded-lg whitespace-pre-wrap ${
                        csvMessage.startsWith('✓') 
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                          : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                      }`}>
                        <p className="text-sm">{csvMessage}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">CSV Format Example:</p>
                    <pre className="text-xs text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 p-3 rounded overflow-x-auto">
{`election_code,first_name,last_name
ABC123,John,Doe
XYZ789,Jane,Smith
DEF456,Bob,`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Google Sheets Sync Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Sync from Google Sheets
                </h2>
                <div className="max-w-md">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Sync voter data from Google Sheets to Supabase database. Requires Google Sheets API configuration.
                  </p>
                  <button
                    onClick={handleSync}
                    disabled={loading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Syncing...' : 'Sync from Google Sheets'}
                  </button>
                  {syncMessage && (
                    <div className={`mt-4 p-4 rounded-lg ${
                      syncMessage.startsWith('✓') 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                    }`}>
                      <p className="text-sm">{syncMessage}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              {/* Google Sheet URL Sync */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Sync from Google Sheet URL
                </h2>
                <div className="max-w-2xl">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Enter a Google Sheets URL to sync voter data. The sheet should be publicly accessible (view permission) or you need Google Sheets API credentials.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Google Sheet URL
                      </label>
                      <input
                        type="url"
                        value={sheetUrl}
                        onChange={(e) => setSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/163BMLKY3rzA6udXKJiuDMamGYlejd7_q/edit"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        disabled={syncingSheet}
                      />
                    </div>
                    <button
                      onClick={handleSyncSheetUrl}
                      disabled={syncingSheet || !sheetUrl.trim()}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {syncingSheet ? 'Syncing...' : 'Sync from Sheet URL'}
                    </button>
                    {sheetSyncMessage && (
                      <div className={`p-4 rounded-lg whitespace-pre-wrap ${
                        sheetSyncMessage.startsWith('✓') 
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                          : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                      }`}>
                        <p className="text-sm">{sheetSyncMessage}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">How to make a sheet public:</p>
                    <ol className="text-sm text-blue-700 dark:text-blue-400 list-decimal list-inside space-y-1">
                      <li>Open your Google Sheet</li>
                      <li>Click "Share" button (top right)</li>
                      <li>Change access to "Anyone with the link" → "Viewer"</li>
                      <li>Copy the sheet URL and paste above</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Database Reset */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Database Management
                </h2>
                <div className="max-w-2xl">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <p className="text-red-800 dark:text-red-200 text-sm font-medium mb-2">
                      ⚠️ Warning: This action cannot be undone
                    </p>
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      Resetting the database will permanently delete ALL votes, voters, and candidates. Use this to start fresh with a clean database.
                    </p>
                  </div>
                  <button
                    onClick={handleResetDb}
                    disabled={resettingDb}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resettingDb ? 'Resetting...' : 'Reset Database (Delete All Data)'}
                  </button>
                  {resetMessage && (
                    <div className={`mt-4 p-4 rounded-lg whitespace-pre-wrap ${
                      resetMessage.startsWith('✓') 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                    }`}>
                      <p className="text-sm">{resetMessage}</p>
                    </div>
                  )}
                </div>
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

