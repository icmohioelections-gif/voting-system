'use client';

import { useMemo, useState } from 'react';
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
import VoterActions from './VoterActions';
import VotingTimer from './VotingTimer';

interface Voter {
  id: string;
  election_code: string;
  first_name: string;
  last_name: string | null;
  has_voted: boolean;
  voted_at: string | null;
  is_logged_in: boolean;
  last_login: string | null;
  voting_start_date: string | null;
  voting_period_days?: number;
}

export default function VotersTable({ voters }: { voters: Voter[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<Voter>[]>(
    () => [
      {
        accessorKey: 'election_code',
        header: 'Election Code',
        cell: (info) => (
          <span className="font-mono text-sm text-gray-900 dark:text-white">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'first_name',
        header: 'Name',
        cell: (info) => {
          const row = info.row.original;
          return (
            <span className="text-sm text-gray-900 dark:text-white">
              {row.first_name} {row.last_name || ''}
            </span>
          );
        },
      },
      {
        accessorKey: 'has_voted',
        header: 'Vote Status',
        cell: (info) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              info.getValue()
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {info.getValue() ? 'Voted' : 'Not Voted'}
          </span>
        ),
      },
      {
        accessorKey: 'is_logged_in',
        header: 'Login Status',
        cell: (info) => {
          const isLoggedIn = info.getValue() as boolean;
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isLoggedIn
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {isLoggedIn && (
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              )}
              {isLoggedIn ? 'Logged In' : 'Not Logged In'}
            </span>
          );
        },
      },
      {
        accessorKey: 'last_login',
        header: 'Last Login',
        cell: (info) => {
          const value = info.getValue() as string | null;
          return (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {value ? new Date(value).toLocaleString() : 'Never'}
            </span>
          );
        },
      },
      {
        accessorKey: 'voted_at',
        header: 'Voted At',
        cell: (info) => {
          const value = info.getValue() as string | null;
          return (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {value ? new Date(value).toLocaleString() : '-'}
            </span>
          );
        },
      },
      {
        id: 'time_remaining',
        header: 'Time Remaining',
        cell: (info) => {
          const voter = info.row.original;
          return (
            <VotingTimer
              votingStartDate={voter.voting_start_date}
              votingPeriodDays={voter.voting_period_days || 5}
            />
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const voter = info.row.original;
          return <VoterActions electionCode={voter.election_code} />;
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: voters,
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
        pageSize: 25,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Search by name, code, or status..."
          />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {table.getFilteredRowModel().rows.length} of {voters.length} voters
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' ↑',
                        desc: ' ↓',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            First
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Last
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Page</span>
          <strong>
            {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </strong>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

