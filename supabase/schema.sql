-- Voting System Database Schema
-- Execute this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voters table (source of truth syncs with Google Sheets)
CREATE TABLE IF NOT EXISTS voters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_code TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    has_voted BOOLEAN DEFAULT FALSE NOT NULL,
    voted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voter_id UUID NOT NULL REFERENCES voters(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(voter_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_voters_election_code ON voters(election_code);
CREATE INDEX IF NOT EXISTS idx_voters_has_voted ON voters(has_voted);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes(candidate_id);

-- Enable Row Level Security
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Voters can view their own record" ON voters;
DROP POLICY IF EXISTS "Anyone can read candidates" ON candidates;
DROP POLICY IF EXISTS "Service role can do everything" ON voters;
DROP POLICY IF EXISTS "Service role can do everything" ON votes;
DROP POLICY IF EXISTS "Service role can do everything" ON candidates;

-- RLS Policies for voters
-- Allow service role to do everything (for API routes with service key)
CREATE POLICY "Service role can do everything on voters"
ON voters FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Allow anonymous users to check if they can vote (limited read access via function)
-- This is handled by API routes, so we restrict direct table access

-- RLS Policies for votes
-- Only service role can insert/read votes (handled via API)
CREATE POLICY "Service role can do everything on votes"
ON votes FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for candidates
-- Anyone can read candidates
CREATE POLICY "Anyone can read candidates"
ON candidates FOR SELECT
USING (true);

-- Service role can manage candidates
CREATE POLICY "Service role can manage candidates"
ON candidates FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to update updated_at
CREATE TRIGGER update_voters_updated_at BEFORE UPDATE ON voters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add 2 default candidates if they don't exist
INSERT INTO candidates (name, position)
SELECT 'Candidate 1', 'President'
WHERE NOT EXISTS (
  SELECT 1 FROM candidates WHERE name = 'Candidate 1' AND position = 'President'
);

INSERT INTO candidates (name, position)
SELECT 'Candidate 2', 'President'
WHERE NOT EXISTS (
  SELECT 1 FROM candidates WHERE name = 'Candidate 2' AND position = 'President'
);

