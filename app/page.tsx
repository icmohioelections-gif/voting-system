'use client';

import Link from 'next/link';
import CandidateCard from '@/components/CandidateCard';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Vote, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  position: string;
  photo_url: string | null;
  description: string | null;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Fetch candidates
    fetch('/api/candidates')
      .then(res => res.json())
      .then(data => {
        if (data.candidates) {
          setCandidates(data.candidates);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching candidates:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
                <ShieldCheck className="w-4 h-4" />
                Secure & Anonymous Voting
              </div>
              
              <h1 
                className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]"
                style={{ fontFamily: 'var(--font-anton), sans-serif' }}
              >
                THE FUTURE OF <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">DEMOCRACY</span> IS HERE
              </h1>
              
              <p 
                className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
              >
                Experience a voting platform built on integrity. 
                Secure authentication, real-time analytics, and an intuitive interface designed for the modern voter.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
                  >
                    Vote Now <Vote className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link href="/admin/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="h-14 px-8 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-full text-lg border-2 border-gray-200 dark:border-gray-700 transition-all flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
                  >
                    Admin Access <Lock className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Candidates Section */}
      {candidates.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
                style={{ fontFamily: 'var(--font-anton), sans-serif' }}
              >
                MEET THE CANDIDATES
              </h2>
              <p 
                className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
              >
                Review the candidates running in this election. Click "Vote Now" above to cast your ballot.
              </p>
            </motion.div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className={`grid gap-8 ${
                candidates.length === 1 
                  ? 'grid-cols-1 max-w-md mx-auto' 
                  : candidates.length === 2
                  ? 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}>
                {candidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <CandidateCard candidate={candidate} interactive={false} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Feature Grid */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />}
              title="Secure Authentication"
              description="Your identity is verified using unique election codes, ensuring one person, one vote."
            />
            <FeatureCard 
              icon={<Vote className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
              title="Easy Casting"
              description="A seamless, accessible interface that makes voting take seconds, not minutes."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
              title="Instant Verification"
              description="Receive immediate confirmation that your voice has been counted securely."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl w-fit border border-gray-200 dark:border-gray-600">{icon}</div>
      <h3 
        className="text-xl font-bold mb-2 text-gray-900 dark:text-white"
        style={{ fontFamily: 'var(--font-anton), sans-serif' }}
      >
        {title}
      </h3>
      <p 
        className="text-gray-600 dark:text-gray-400 leading-relaxed"
        style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
      >
        {description}
      </p>
    </motion.div>
  );
}
