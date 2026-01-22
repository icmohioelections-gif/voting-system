'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminDashboard from '../AdminDashboard';
import { isAdminSessionValid, verifyAdminSession } from '@/lib/admin-auth';

export default function AdminTabPage() {
  const params = useParams();
  const router = useRouter();
  const tab = params?.tab as string;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  // Valid tabs
  const validTabs = ['results', 'voters', 'candidates', 'settings', 'templates'];
  
  useEffect(() => {
    // Check admin authentication
    const checkAuth = async () => {
      const token = sessionStorage.getItem('admin_session_token');
      if (!token || !isAdminSessionValid()) {
        router.replace('/admin/login');
        return;
      }
      
      // Verify session with server
      const isValid = await verifyAdminSession(token);
      if (!isValid) {
        router.replace('/admin/login');
        return;
      }
      
      setIsAuthenticated(true);
      setChecking(false);
    };

    checkAuth();
    
    // Redirect to results if invalid tab
    if (tab && !validTabs.includes(tab)) {
      router.replace('/admin/results');
    }
  }, [tab, router]);

  if (checking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If no tab or invalid tab, show results by default
  const activeTab = (tab && validTabs.includes(tab) && tab !== 'templates') ? tab : 'results';

  return <AdminDashboard activeTab={activeTab as 'results' | 'voters' | 'candidates' | 'settings' | 'templates'} />;
}

