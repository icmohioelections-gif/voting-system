'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminDashboard from '../AdminDashboard';

export default function AdminTabPage() {
  const params = useParams();
  const router = useRouter();
  const tab = params?.tab as string;

  // Valid tabs
  const validTabs = ['results', 'voters', 'candidates', 'settings'];
  
  useEffect(() => {
    // Redirect to results if invalid tab
    if (tab && !validTabs.includes(tab)) {
      router.replace('/admin/results');
    }
  }, [tab, router]);

  // If no tab or invalid tab, show results by default
  const activeTab = (tab && validTabs.includes(tab)) ? tab : 'results';

  return <AdminDashboard activeTab={activeTab as 'results' | 'voters' | 'candidates' | 'settings'} />;
}

