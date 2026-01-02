import { supabaseAdmin } from './supabase';
import crypto from 'crypto';

const SESSION_DURATION_MINUTES = 30; // 30 minutes session timeout

export function generateSessionToken(): string {
  // This is a server-side function, so we can use Node.js crypto
  return crypto.randomBytes(32).toString('hex');
}

export async function createSession(voterId: string, electionCode: string): Promise<string> {
  // Delete any existing sessions for this voter (prevent double sessions)
  await supabaseAdmin
    .from('sessions')
    .delete()
    .eq('voter_id', voterId);

  const sessionToken = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + SESSION_DURATION_MINUTES);

  const { error } = await supabaseAdmin
    .from('sessions')
    .insert({
      voter_id: voterId,
      election_code: electionCode,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
      last_activity: new Date().toISOString(),
    });

  if (error) {
    throw new Error('Failed to create session');
  }

  // Update voter login status
  await supabaseAdmin
    .from('voters')
    .update({
      is_logged_in: true,
      last_login: new Date().toISOString(),
    })
    .eq('id', voterId);

  return sessionToken;
}

export async function verifySession(sessionToken: string): Promise<{
  valid: boolean;
  voterId?: string;
  electionCode?: string;
}> {
  const { data: session, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .single();

  if (error || !session) {
    return { valid: false };
  }

  // Check if session expired
  const expiresAt = new Date(session.expires_at);
  const now = new Date();

  if (now > expiresAt) {
    // Session expired, clean it up
    await supabaseAdmin.from('sessions').delete().eq('id', session.id);
    await supabaseAdmin
      .from('voters')
      .update({ is_logged_in: false })
      .eq('id', session.voter_id);
    return { valid: false };
  }

  // Update last activity
  await supabaseAdmin
    .from('sessions')
    .update({ last_activity: new Date().toISOString() })
    .eq('id', session.id);

  return {
    valid: true,
    voterId: session.voter_id,
    electionCode: session.election_code,
  };
}

export async function deleteSession(voterId: string): Promise<void> {
  await supabaseAdmin
    .from('sessions')
    .delete()
    .eq('voter_id', voterId);

  await supabaseAdmin
    .from('voters')
    .update({ is_logged_in: false })
    .eq('id', voterId);
}

export async function deleteSessionByToken(sessionToken: string): Promise<void> {
  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('voter_id')
    .eq('session_token', sessionToken)
    .single();

  if (session) {
    await deleteSession(session.voter_id);
  }
}

export async function cleanupExpiredSessions(): Promise<void> {
  const now = new Date().toISOString();

  // Get expired sessions
  const { data: expiredSessions } = await supabaseAdmin
    .from('sessions')
    .select('voter_id')
    .lt('expires_at', now);

  if (expiredSessions && expiredSessions.length > 0) {
    const voterIds = [...new Set(expiredSessions.map(s => s.voter_id))];

    // Delete expired sessions
    await supabaseAdmin
      .from('sessions')
      .delete()
      .lt('expires_at', now);

    // Update voter login status
    await supabaseAdmin
      .from('voters')
      .update({ is_logged_in: false })
      .in('id', voterIds);
  }
}

