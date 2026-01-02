import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Simple admin credentials (user said they'll change this later)
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin';

// Store admin sessions in memory (for production, use Redis or database)
const adminSessions = new Map<string, { expiresAt: Date }>();

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Verify credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    adminSessions.set(sessionToken, { expiresAt });

    // Clean up expired sessions
    const now = new Date();
    for (const [token, session] of adminSessions.entries()) {
      if (session.expiresAt < now) {
        adminSessions.delete(token);
      }
    }

    return NextResponse.json({
      success: true,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export function to verify admin session
export function verifyAdminSession(sessionToken: string): boolean {
  const session = adminSessions.get(sessionToken);
  if (!session) return false;
  
  if (session.expiresAt < new Date()) {
    adminSessions.delete(sessionToken);
    return false;
  }
  
  return true;
}

