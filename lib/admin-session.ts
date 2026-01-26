// Robust admin session management
// This module provides a centralized, reliable way to manage admin sessions

interface SessionState {
  token: string;
  expiresAt: string;
  lastVerified: number;
  isValid: boolean;
}

class AdminSessionManager {
  private sessionKey = 'admin_session_token';
  private expiresKey = 'admin_session_expires';
  private stateKey = 'admin_session_state';
  private verificationCache: Map<string, { isValid: boolean; timestamp: number }> = new Map();
  private verificationTimeout = 30000; // Cache verification for 30 seconds
  private isVerifying = false;
  private verificationPromise: Promise<boolean> | null = null;

  // Get session token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(this.sessionKey);
  }

  // Set session token
  setToken(token: string, expiresAt: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(this.sessionKey, token);
    sessionStorage.setItem(this.expiresKey, expiresAt);
    this.updateState({ token, expiresAt, lastVerified: Date.now(), isValid: true });
  }

  // Clear session (only admin session, not all sessionStorage)
  clearSession(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(this.sessionKey);
    sessionStorage.removeItem(this.expiresKey);
    sessionStorage.removeItem(this.stateKey);
    this.verificationCache.clear();
  }

  // Check if session exists and is not expired (client-side check only)
  hasValidToken(): boolean {
    if (typeof window === 'undefined') return false;
    const token = this.getToken();
    const expiresAt = sessionStorage.getItem(this.expiresKey);
    
    if (!token || !expiresAt) return false;
    
    const expiryDate = new Date(expiresAt);
    if (expiryDate < new Date()) {
      this.clearSession();
      return false;
    }
    
    return true;
  }

  // Verify session with server (with caching and deduplication)
  async verifySession(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const token = this.getToken();
    if (!token) return false;

    // Check cache first
    const cached = this.verificationCache.get(token);
    if (cached && Date.now() - cached.timestamp < this.verificationTimeout) {
      return cached.isValid;
    }

    // If already verifying, return the existing promise
    if (this.isVerifying && this.verificationPromise) {
      return this.verificationPromise;
    }

    // Start new verification
    this.isVerifying = true;
    this.verificationPromise = this.performVerification(token);

    try {
      const isValid = await this.verificationPromise;
      return isValid;
    } finally {
      this.isVerifying = false;
      this.verificationPromise = null;
    }
  }

  private async performVerification(token: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: token }),
        // Add timeout
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (!response.ok) {
        this.verificationCache.set(token, { isValid: false, timestamp: Date.now() });
        return false;
      }

      const data = await response.json();
      const isValid = data.valid === true;
      
      // Cache the result
      this.verificationCache.set(token, { isValid, timestamp: Date.now() });
      
      // Update state
      if (isValid) {
        this.updateState({
          token,
          expiresAt: sessionStorage.getItem(this.expiresKey) || '',
          lastVerified: Date.now(),
          isValid: true,
        });
      } else {
        this.clearSession();
      }

      return isValid;
    } catch (error) {
      console.error('Session verification error:', error);
      
      // On network error, check if we have a recent valid verification
      const state = this.getState();
      if (state && state.isValid && Date.now() - state.lastVerified < 60000) {
        // If we verified in the last minute, trust it
        return true;
      }
      
      // Otherwise, fail
      this.verificationCache.set(token, { isValid: false, timestamp: Date.now() });
      return false;
    }
  }

  // Get session state
  private getState(): SessionState | null {
    if (typeof window === 'undefined') return null;
    const stateStr = sessionStorage.getItem(this.stateKey);
    if (!stateStr) return null;
    try {
      return JSON.parse(stateStr);
    } catch {
      return null;
    }
  }

  // Update session state
  private updateState(state: SessionState): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(this.stateKey, JSON.stringify(state));
  }

  // Clear only voter-related session items (not admin session)
  clearVoterSession(): void {
    if (typeof window === 'undefined') return;
    const adminToken = sessionStorage.getItem(this.sessionKey);
    const adminExpires = sessionStorage.getItem(this.expiresKey);
    const adminState = sessionStorage.getItem(this.stateKey);
    
    // Clear all sessionStorage
    sessionStorage.clear();
    
    // Restore admin session
    if (adminToken) {
      sessionStorage.setItem(this.sessionKey, adminToken);
    }
    if (adminExpires) {
      sessionStorage.setItem(this.expiresKey, adminExpires);
    }
    if (adminState) {
      sessionStorage.setItem(this.stateKey, adminState);
    }
  }
}

// Export singleton instance
export const adminSession = new AdminSessionManager();

// Export convenience functions
export function getAdminSessionToken(): string | null {
  return adminSession.getToken();
}

export function setAdminSessionToken(token: string, expiresAt: string): void {
  adminSession.setToken(token, expiresAt);
}

export function clearAdminSession(): void {
  adminSession.clearSession();
}

export function isAdminSessionValid(): boolean {
  return adminSession.hasValidToken();
}

export async function verifyAdminSession(token?: string): Promise<boolean> {
  return adminSession.verifySession();
}
