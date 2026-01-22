'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { isAdminSessionValid, verifyAdminSession } from '@/lib/admin-auth';

// Dynamically import TinyMCE React component to avoid SSR issues
// Using self-hosted GPL version (no API key needed)
const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">Loading editor...</div>
});

interface Template {
  id: string;
  name: string;
  content: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check admin authentication
    const checkAuth = async () => {
      const token = sessionStorage.getItem('admin_session_token');
      if (!token || !isAdminSessionValid()) {
        router.replace('/admin/login');
        return;
      }
      
      try {
        // Verify session with server (same as AdminTabPage)
        const isValid = await verifyAdminSession(token);
        if (!isValid) {
          router.replace('/admin/login');
          return;
        }
        
        setIsAuthenticated(true);
        setChecking(false);
        fetchTemplates();
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  if (checking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // Get only the default template
      const res = await fetch('/api/admin/letter-templates?default=true');
      const data = await res.json();
      if (data.success && data.template) {
        // Only work with single default template
        setTemplates([data.template]);
        setSelectedTemplate(data.template);
        // Set editor content after a short delay to ensure editor is initialized
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.setContent(data.template.content);
          }
        }, 200);
      } else {
        // If no default template exists, create one
        setMessage('⚠ No default template found. Please save to create one.');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setMessage('✗ Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const content = editorRef.current?.getContent() || '';
    if (!content.trim()) {
      setMessage('✗ Template content is required');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      if (selectedTemplate && selectedTemplate.id) {
        // Update existing default template
        const res = await fetch('/api/admin/letter-templates', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedTemplate.id,
            name: 'Default Template',
            content,
            is_default: true,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setMessage('✓ Template saved successfully');
          await fetchTemplates();
        } else {
          setMessage(`✗ Error: ${data.error}`);
        }
      } else {
        // Create default template if it doesn't exist
        const res = await fetch('/api/admin/letter-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Default Template',
            content,
            is_default: true,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setMessage('✓ Template created successfully');
          await fetchTemplates();
        } else {
          setMessage(`✗ Error: ${data.error}`);
        }
      }
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Failed to save template'}`);
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'var(--font-anton), sans-serif' }}>
                Letter Templates
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2" style={{ fontFamily: 'var(--font-alexandria), sans-serif' }}>
                Create and edit letter templates for voter communications
              </p>
            </div>
            <Link
              href="/admin/voters"
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Back to Voters
            </Link>
          </div>

          <div className="space-y-4">
            {/* Template Editor */}
            <div>
              <div className="space-y-4">
                {/* Template Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-300">
                    <strong>Default Template:</strong> This is the only template used for all voter letters. Edit the content below and save to update.
                  </p>
                </div>

                {/* Template Variables Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                  <p className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Available Variables:</p>
                  <div className="grid grid-cols-2 gap-2 text-blue-800 dark:text-blue-400">
                    <code>{'{{full_name}}'}</code>
                    <code>{'{{first_name}}'}</code>
                    <code>{'{{last_name}}'}</code>
                    <code>{'{{election_code}}'}</code>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-500 mt-2">
                    Conditional: {'{{#last_name}}'} content {'{{/last_name}}'} (only shows if last_name exists)
                  </p>
                </div>

                {/* TinyMCE Editor */}
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <Editor
                    licenseKey="gpl"
                    onInit={(evt, editor) => (editorRef.current = editor)}
                    initialValue={selectedTemplate?.content || ''}
                    init={{
                      height: 600,
                      menubar: true,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
                      content_style: 'body { font-family: Arial, sans-serif; font-size: 14px }',
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Template'}
                  </button>
                </div>

                {/* Message */}
                {message && (
                  <div className={`p-4 rounded-lg ${
                    message.startsWith('✓')
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                  }`}>
                    <p className="text-sm">{message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
