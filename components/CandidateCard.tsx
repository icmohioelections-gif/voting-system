'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface Candidate {
  id: string;
  name: string;
  position: string;
  photo_url: string | null;
  description: string | null;
}

interface CandidateCardProps {
  candidate: Candidate;
  selected?: boolean;
  onSelect?: (id: string) => void;
  disabled?: boolean;
  interactive?: boolean;
}

export default function CandidateCard({ 
  candidate, 
  selected = false, 
  onSelect, 
  disabled = false,
  interactive = true 
}: CandidateCardProps) {
  const handleClick = () => {
    if (!disabled && interactive && onSelect) {
      onSelect(candidate.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!disabled && interactive ? { y: -4 } : {}}
      className={`
        relative group cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-300
        ${selected
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/20 ring-offset-2'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
        ${!interactive ? 'cursor-default' : ''}
      `}
      onClick={handleClick}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
        {candidate.photo_url ? (
          <Image
            src={candidate.photo_url}
            alt={candidate.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-6xl font-bold">
            {candidate.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
        
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 bg-indigo-500 text-white p-2 rounded-full shadow-lg"
          >
            <CheckCircle className="w-6 h-6" />
          </motion.div>
        )}
      </div>

      <div className="p-5 relative z-10 -mt-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <h3 
            className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1 mb-1"
            style={{ fontFamily: 'var(--font-anton), sans-serif' }}
          >
            {candidate.name}
          </h3>
          <p 
            className="text-indigo-600 dark:text-indigo-400 font-medium text-sm tracking-wide uppercase mb-3"
            style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
          >
            {candidate.position}
          </p>
          {candidate.description && (
            <p 
              className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2"
              style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}
            >
              {candidate.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}


