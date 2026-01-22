-- Migration: Add election settings table
-- Execute this in Supabase SQL Editor

-- Create election_settings table to store election configuration
CREATE TABLE IF NOT EXISTS election_settings (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    voting_period_days INTEGER DEFAULT 5 NOT NULL,
    election_status TEXT DEFAULT 'not_started' NOT NULL CHECK (election_status IN ('not_started', 'active', 'ended')),
    election_start_date TIMESTAMP WITH TIME ZONE,
    election_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if not exists
INSERT INTO election_settings (id, voting_period_days, election_status)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 5, 'not_started')
ON CONFLICT (id) DO NOTHING;

-- Create index
CREATE INDEX IF NOT EXISTS idx_election_settings_id ON election_settings(id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_election_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_election_settings_updated_at ON election_settings;
CREATE TRIGGER update_election_settings_updated_at 
    BEFORE UPDATE ON election_settings
    FOR EACH ROW EXECUTE FUNCTION update_election_settings_updated_at();

-- RLS Policy for election_settings
ALTER TABLE election_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can do everything on election_settings" ON election_settings;
CREATE POLICY "Service role can do everything on election_settings"
ON election_settings FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
