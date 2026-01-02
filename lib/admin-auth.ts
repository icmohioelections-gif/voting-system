// Admin authentication utilities

export function getAdminSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('admin_session_token');
}

export function setAdminSessionToken(token: string, expiresAt: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('admin_session_token', token);
  sessionStorage.setItem('admin_session_expires', expiresAt);
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('admin_session_token');
  sessionStorage.removeItem('admin_session_expires');
}

export function isAdminSessionValid(): boolean {
  if (typeof window === 'undefined') return false;
  const token = sessionStorage.getItem('admin_session_token');
  const expiresAt = sessionStorage.getItem('admin_session_expires');
  
  if (!token || !expiresAt) return false;
  
  const expiryDate = new Date(expiresAt);
  if (expiryDate < new Date()) {
    clearAdminSession();
    return false;
  }
  
  return true;
}

export async function verifyAdminSession(token: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/verify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_token: token }),
    });
    
    if (!response.ok) return false;
    const data = await response.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

