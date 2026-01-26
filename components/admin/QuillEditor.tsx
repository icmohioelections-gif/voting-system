'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">Loading editor...</div>
});

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
  const [cssLoaded, setCssLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure CSS is loaded
    if (typeof window === 'undefined') return;

    try {
      const linkId = 'quill-css';
      let link = document.getElementById(linkId) as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
        link.onload = () => setCssLoaded(true);
        link.onerror = () => {
          setError('Failed to load editor styles');
          setCssLoaded(true); // Still try to render
        };
        document.head.appendChild(link);
      } else {
        setCssLoaded(true);
      }
    } catch (err) {
      console.error('Error loading Quill CSS:', err);
      setError('Error loading editor');
      setCssLoaded(true);
    }
  }, []);

  if (error) {
    return (
      <div className="h-[500px] bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center border border-red-200 dark:border-red-800">
        <div className="text-center">
          <p className="text-red-800 dark:text-red-300 mb-2">{error}</p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-[400px] p-4 border rounded"
            placeholder="Editor unavailable. Use plain text editor instead."
          />
        </div>
      </div>
    );
  }

  if (!cssLoaded) {
    return (
      <div className="h-[500px] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="quill-wrapper">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={{
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
          ]
        }}
        formats={[
          'header',
          'bold', 'italic', 'underline', 'strike',
          'color', 'background',
          'list', 'bullet',
          'align',
          'link', 'image'
        ]}
        style={{ height: '500px' }}
        className="h-[500px]"
      />
    </div>
  );
}
