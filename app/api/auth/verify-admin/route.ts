import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '../admin-login/route';

export async function POST(request: NextRequest) {
  try {
    const { session_token } = await request.json();

    if (!session_token) {
      return NextResponse.json(
        { valid: false, error: 'Session token required' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminSession(session_token);

    return NextResponse.json({
      valid: isValid,
    });
  } catch (error) {
    console.error('Admin session verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

