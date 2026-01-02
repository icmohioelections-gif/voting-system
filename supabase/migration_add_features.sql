-- Migration: Add new features for updated requirements
-- Execute this in Supabase SQL Editor

-- Add photo and description to candidates table
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add voting window start date to voters table
-- This will be used to enforce 5-day voting window
ALTER TABLE voters
ADD COLUMN IF NOT EXISTS voting_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing voters to have voting_start_date = created_at
UPDATE voters 
SET voting_start_date = created_at 
WHERE voting_start_date IS NULL;

-- Add index for voting window queries
CREATE INDEX IF NOT EXISTS idx_voters_voting_start_date ON voters(voting_start_date);

