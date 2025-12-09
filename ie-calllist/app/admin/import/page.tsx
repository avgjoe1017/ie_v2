'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';

interface ImportResult {
  success: boolean;
  created: number;
  updated: number;
  errors: string[];
}

export default function AdminImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(undefined);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(undefined);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setResult(data);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header showBack title="Import CSV" />
      
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Admin Nav */}
        <div className="flex gap-4 mb-6">
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Stations
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Users
          </Link>
          <Link
            href="/admin/import"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
          >
            Import CSV
          </Link>
        </div>

        {/* Import Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Import Station Data
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Upload a CSV file to import or update station data. The CSV should have the following columns:
            </p>
          </div>

          {/* CSV Format Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
              Feed, Status, Rank, Station, City, Air Time, ET Time, Main Name, Main Phone, #2 Name, Phone #2, #3 Name, Phone #3, #4 Name, Phone #4
            </p>
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select CSV File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                dark:file:bg-blue-900/30 dark:file:text-blue-400
                hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
            />
          </div>

          {file && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Selected: {file.name}
              </span>
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import'
                )}
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`rounded-xl p-4 ${
              result.success
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            }`}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Import Complete
              </h3>
              <ul className="text-sm space-y-1">
                <li className="text-green-700 dark:text-green-400">
                  ✓ {result.created} stations created
                </li>
                <li className="text-blue-700 dark:text-blue-400">
                  ↻ {result.updated} stations updated
                </li>
                {result.errors.length > 0 && (
                  <li className="text-red-700 dark:text-red-400">
                    ✗ {result.errors.length} errors
                  </li>
                )}
              </ul>
              
              {result.errors.length > 0 && (
                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg max-h-40 overflow-y-auto">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Errors:
                  </p>
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400">
                      {err}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

