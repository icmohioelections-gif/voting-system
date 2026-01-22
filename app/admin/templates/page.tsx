'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

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
  const [templateName, setTemplateName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isNewTemplate, setIsNewTemplate] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/letter-templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
        if (data.templates && data.templates.length > 0 && !selectedTemplate) {
          const defaultTemplate = data.templates.find((t: Template) => t.is_default) || data.templates[0];
          setSelectedTemplate(defaultTemplate);
          setTemplateName(defaultTemplate.name);
          setIsDefault(defaultTemplate.is_default);
          // Set editor content after a short delay to ensure editor is initialized
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.setContent(defaultTemplate.content);
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setMessage('✗ Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setIsDefault(template.is_default);
    setIsNewTemplate(false);
    setMessage('');
    // Update editor content when template changes
    if (editorRef.current) {
      editorRef.current.setContent(template.content);
    }
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setTemplateName('');
    setIsDefault(false);
    setIsNewTemplate(true);
    setMessage('');
    if (editorRef.current) {
      editorRef.current.setContent('');
    }
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      setMessage('✗ Template name is required');
      return;
    }

    const content = editorRef.current?.getContent() || '';
    if (!content.trim()) {
      setMessage('✗ Template content is required');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      if (isNewTemplate || !selectedTemplate) {
        // Create new template
        const res = await fetch('/api/admin/letter-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: templateName.trim(),
            content,
            is_default: isDefault,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setMessage('✓ Template created successfully');
          setIsNewTemplate(false);
          await fetchTemplates();
          if (data.template) {
            setSelectedTemplate(data.template);
          }
        } else {
          setMessage(`✗ Error: ${data.error}`);
        }
      } else {
        // Update existing template
        const res = await fetch('/api/admin/letter-templates', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedTemplate.id,
            name: templateName.trim(),
            content,
            is_default: isDefault,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setMessage('✓ Template updated successfully');
          await fetchTemplates();
          if (data.template) {
            setSelectedTemplate(data.template);
          }
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

  const handleDelete = async () => {
    if (!selectedTemplate || isNewTemplate) return;

    if (!confirm(`Are you sure you want to delete "${selectedTemplate.name}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/letter-templates?id=${selectedTemplate.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setMessage('✓ Template deleted successfully');
        setSelectedTemplate(null);
        setTemplateName('');
        setIsDefault(false);
        await fetchTemplates();
      } else {
        setMessage(`✗ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Failed to delete template'}`);
    } finally {
      setLoading(false);
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Templates List */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Templates</h2>
                  <button
                    onClick={handleNewTemplate}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    + New
                  </button>
                </div>
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No templates found</div>
                ) : (
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedTemplate?.id === template.id
                            ? 'bg-indigo-100 dark:bg-indigo-900/20 border-indigo-500'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </span>
                          {template.is_default && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(template.updated_at).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Template Editor */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {/* Template Name and Settings */}
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Template Name"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="rounded"
                    />
                    Set as default
                  </label>
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
                      // Self-hosted GPL version - no API key needed
                      // TinyMCE will work without API key in GPL mode
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving || !templateName.trim()}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : isNewTemplate ? 'Create Template' : 'Save Template'}
                  </button>
                  {selectedTemplate && !isNewTemplate && (
                    <button
                      onClick={handleDelete}
                      disabled={selectedTemplate.is_default}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  )}
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
