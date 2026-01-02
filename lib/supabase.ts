import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for client-side operations (public)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (service role)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Types
export interface Voter {
  id: string;
  election_code: string;
  first_name: string;
  last_name: string | null;
  has_voted: boolean;
  voted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  name: string;
  position: string;
  photo_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  voter_id: string;
  candidate_id: string;
  created_at: string;
}

