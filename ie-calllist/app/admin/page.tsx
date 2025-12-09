'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { FeedBadge, StatusBadge } from '@/components/StatusBadge';
import { marketsApi, adminApi, type Station } from '@/lib/api';
import type { Feed } from '@/domain/contracts';

export default function AdminPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [feedFilter, setFeedFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const { stations } = await marketsApi.list();
      setStations(stations);
    } catch (err) {
      console.error('Failed to load stations:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredStations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStations.map((s) => s.id)));
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0 || !bulkStatus) return;

    try {
      await adminApi.bulkUpdate({
        stationIds: Array.from(selectedIds),
        updates: {
          broadcastStatus: bulkStatus === 'none' ? null : bulkStatus as 'live' | 'rerack' | 'might',
        },
      });
      
      await loadStations();
      setSelectedIds(new Set());
      setBulkStatus('');
    } catch (err) {
      console.error('Bulk update failed:', err);
    }
  };

  const filteredStations = stations.filter((s) => {
    if (feedFilter !== 'all' && s.feed !== feedFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.callLetters.toLowerCase().includes(q) ||
        s.marketName.toLowerCase().includes(q) ||
        s.marketNumber.toString().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header showBack title="Admin Panel" />
      
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* Admin Nav */}
        <div className="flex gap-4 mb-6">
          <Link
            href="/admin"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
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
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Import CSV
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stations..."
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex-1 min-w-[200px]"
          />
          
          <select
            value={feedFilter}
            onChange={(e) => setFeedFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Feeds</option>
            <option value="3pm">3PM</option>
            <option value="5pm">5PM</option>
            <option value="6pm">6PM</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center gap-4 flex-wrap">
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              {selectedIds.size} selected
            </span>
            
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Set status...</option>
              <option value="live">LIVE</option>
              <option value="rerack">RERACK</option>
              <option value="might">MIGHT</option>
              <option value="none">Clear Status</option>
            </select>
            
            <button
              onClick={handleBulkUpdate}
              disabled={!bulkStatus}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              Apply
            </button>
            
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-1.5 text-blue-600 dark:text-blue-400"
            >
              Clear
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredStations.length && filteredStations.length > 0}
                      onChange={selectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Station</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Market</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Feed</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Air Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStations.map((station) => (
                  <tr key={station.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(station.id)}
                        onChange={() => toggleSelect(station.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {station.marketNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {station.callLetters}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {station.marketName}
                    </td>
                    <td className="px-4 py-3">
                      <FeedBadge feed={station.feed as Feed} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={station.broadcastStatus as 'live' | 'rerack' | 'might' | null} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {station.airTimeLocal} / {station.airTimeET}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/stations/${station.id}/edit`}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredStations.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No stations found
          </div>
        )}
      </main>
    </div>
  );
}

