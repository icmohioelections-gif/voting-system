'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminDashboard from '../AdminDashboard';
import { adminSession } from '@/lib/admin-session';
import { ErrorBoundary } from '@/components/admin/ErrorBoundary';

export default function AdminTabPage() {
  const params = useParams();
  const router = useRouter();
  const tab = params?.tab as string;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const authCheckRef = useRef(false);
  const authCheckInProgress = useRef(false);

  // Valid tabs
  const validTabs = ['results', 'voters', 'candidates', 'settings'];
  
  useEffect(() => {
    // Prevent multiple simultaneous auth checks
    if (authCheckInProgress.current) return;
    
    // Check admin authentication
    const checkAuth = async () => {
      authCheckInProgress.current = true;
      
      try {
        // Quick client-side check first
        if (!adminSession.hasValidToken()) {
          router.replace('/admin/login');
          return;
        }
        
        // If already authenticated and recently verified, skip server check
        if (isAuthenticated && authCheckRef.current) {
          authCheckInProgress.current = false;
          return;
        }
        
        // Verify session with server (with caching)
        const isValid = await adminSession.verifySession();
        
        if (!isValid) {
          router.replace('/admin/login');
          return;
        }
        
        setIsAuthenticated(true);
        setChecking(false);
        authCheckRef.current = true;
      } catch (error) {
        console.error('Auth check error:', error);
        // On error, if we have a valid token, allow access (fail open for better UX)
        if (adminSession.hasValidToken()) {
          setIsAuthenticated(true);
          setChecking(false);
        } else {
          router.replace('/admin/login');
        }
      } finally {
        authCheckInProgress.current = false;
      }
    };

    checkAuth();
    
    // Redirect to results if invalid tab
    if (tab && !validTabs.includes(tab)) {
      router.replace('/admin/results');
    }
  }, [tab, router, isAuthenticated]);

  if (checking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If no tab or invalid tab, show results by default
  const activeTab = (tab && validTabs.includes(tab)) ? tab : 'results';

  return (
    <ErrorBoundary>
      <AdminDashboard activeTab={activeTab as 'results' | 'voters' | 'candidates' | 'settings'} />
    </ErrorBoundary>
  );
}

