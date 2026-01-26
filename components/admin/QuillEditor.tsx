'use client';

import { useEffect } from 'react';
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
  useEffect(() => {
    // Ensure CSS is loaded
    if (typeof window !== 'undefined') {
      const linkId = 'quill-css';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
        document.head.appendChild(link);
      }
    }
  }, []);

  return (
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
  );
}
