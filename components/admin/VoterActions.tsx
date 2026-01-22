'use client';

import { useState } from 'react';

interface VoterActionsProps {
  electionCode: string;
}

export default function VoterActions({ electionCode }: VoterActionsProps) {
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/admin/voters/letter?election_code=${electionCode}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voter-letter-${electionCode}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download letter');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download letter');
    } finally {
      setDownloading(false);
    }
  };

  const handleEmail = async () => {
    if (!emailAddress.trim()) {
      alert('Please enter an email address');
      return;
    }

    setEmailing(true);
    try {
      const response = await fetch('/api/admin/voters/email-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          election_code: electionCode,
          email: emailAddress.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message || `Letter sent to ${emailAddress}`);
        setShowEmailInput(false);
        setEmailAddress('');
      } else {
        alert(data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email error:', error);
      alert('Failed to send email');
    } finally {
      setEmailing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        title="Download Letter"
      >
        {downloading ? (
          <>
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Downloading...
          </>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </>
        )}
      </button>
      <div className="relative">
        <button
          onClick={() => setShowEmailInput(!showEmailInput)}
          disabled={emailing}
          className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          title="Email Letter"
        >
          {emailing ? (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </>
          )}
        </button>
        {showEmailInput && (
          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 z-10 min-w-[300px]">
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleEmail()}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleEmail}
                disabled={emailing || !emailAddress.trim()}
                className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg disabled:opacity-50"
              >
                Send
              </button>
              <button
                onClick={() => {
                  setShowEmailInput(false);
                  setEmailAddress('');
                }}
                className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
