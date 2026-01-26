import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Admin credentials from environment variables
// IMPORTANT: ADMIN_EMAIL and ADMIN_PASSWORD MUST be set in environment variables
// No default credentials - these MUST be configured for security
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('⚠️ WARNING: ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables!');
}

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

    // Verify credentials are configured
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error('Admin credentials not configured');
      return NextResponse.json(
        { error: 'Admin authentication not configured. Please set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.' },
        { status: 500 }
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


