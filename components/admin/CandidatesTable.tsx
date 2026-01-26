'use client';

import { useState, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useMemo } from 'react';

interface Candidate {
  id: string;
  name: string;
  position: string;
  photo_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface CandidatesTableProps {
  candidates: Candidate[];
  onUpdate: () => void;
}

export default function CandidatesTable({ candidates, onUpdate }: CandidatesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleEdit = (candidate: Candidate) => {
    setEditingId(candidate.id);
    setEditName(candidate.name);
    setEditPosition(candidate.position);
    setEditDescription(candidate.description || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditPosition('');
    setEditDescription('');
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          position: editPosition.trim(),
          description: editDescription.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        onUpdate();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to update candidate'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/candidates/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        onUpdate();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete candidate'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePhotoUpload = async (candidateId: string, file: File) => {
    setUploadingPhoto(candidateId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('candidateId', candidateId);

      const res = await fetch('/api/admin/candidates/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        onUpdate();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to upload photo'}`);
    } finally {
      setUploadingPhoto(null);
    }
  };

  const columns = useMemo<ColumnDef<Candidate>[]>(
    () => [
      {
        accessorKey: 'photo_url',
        header: 'Photo',
        cell: (info) => {
          const candidate = info.row.original;
          const photoUrl = info.getValue() as string | null;
          const isUploading = uploadingPhoto === candidate.id;

          return (
            <div className="flex items-center gap-2">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={candidate.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {candidate.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <input
                type="file"
                ref={(el) => {
                  fileInputRefs.current[candidate.id] = el;
                }}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handlePhotoUpload(candidate.id, file);
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = fileInputRefs.current[candidate.id];
                  if (input) {
                    input.click();
                  }
                }}
                disabled={isUploading}
                className="px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => {
          const candidate = info.row.original;
          if (editingId === candidate.id) {
            return (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            );
          }
          return <span className="font-medium">{info.getValue() as string}</span>;
        },
      },
      {
        accessorKey: 'position',
        header: 'Position',
        cell: (info) => {
          const candidate = info.row.original;
          if (editingId === candidate.id) {
            return (
              <input
                type="text"
                value={editPosition}
                onChange={(e) => setEditPosition(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            );
          }
          return <span>{info.getValue() as string}</span>;
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: (info) => {
          const candidate = info.row.original;
          if (editingId === candidate.id) {
            return (
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
                rows={2}
              />
            );
          }
          return <span className="text-sm text-gray-600 dark:text-gray-400">{info.getValue() as string || '-'}</span>;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const candidate = info.row.original;
          const isEditing = editingId === candidate.id;
          const isDeleting = deletingId === candidate.id;

          if (isEditing) {
            return (
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveEdit(candidate.id)}
                  className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            );
          }

          return (
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(candidate)}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(candidate.id)}
                disabled={isDeleting}
                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          );
        },
      },
    ],
    [editingId, editName, editPosition, editDescription, uploadingPhoto, deletingId]
  );

  const table = useReactTable({
    data: candidates,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search candidates..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            candidates.length
          )}{' '}
          of {candidates.length} candidates
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
