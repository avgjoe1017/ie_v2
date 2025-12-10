'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { marketsApi, type Station } from '@/lib/api';
import { formatDisplay, formatE164 } from '@/domain/phone';
import type { Feed } from '@/domain/contracts';

export default function EditStationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  // Form state
  const [callLetters, setCallLetters] = useState('');
  const [marketName, setMarketName] = useState('');
  const [feed, setFeed] = useState<Feed>('6pm');
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
  const [airTimeLocal, setAirTimeLocal] = useState('');
  const [airTimeET, setAirTimeET] = useState('');
  const [phones, setPhones] = useState<Array<{ id: string; label: string; number: string; sortOrder: number }>>([]);

  useEffect(() => {
    async function loadStation() {
      try {
        const { station } = await marketsApi.get(id);
        setStation(station);
        setCallLetters(station.callLetters);
        setMarketName(station.marketName);
        setFeed(station.feed as Feed);
        setBroadcastStatus(station.broadcastStatus);
        setAirTimeLocal(station.airTimeLocal);
        setAirTimeET(station.airTimeET);
        setPhones(station.phones);
      } catch (err) {
        setError('Failed to load station');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStation();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError(undefined);

    try {
      // Save station core fields
      const updated = await marketsApi.update(id, {
        callLetters,
        marketName,
        feed,
        broadcastStatus: broadcastStatus as 'live' | 'rerack' | 'might' | null,
        airTimeLocal,
        airTimeET,
      });

      // Sync phones: create, update, delete based on differences
      const originalPhones = station?.phones ?? [];

      const originalById = new Map(originalPhones.map((p) => [p.id, p]));
      const currentById = new Map(phones.map((p) => [p.id, p]));

      // Create or update current phones
      for (const phone of phones) {
        const isNew = phone.id.startsWith('new-');
        const payload = {
          label: phone.label,
          number: formatE164(phone.number),
          sortOrder: phone.sortOrder,
        };

        if (isNew) {
          // Create new phone
          await fetch(`/api/markets/${id}/phones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else {
          const original = originalById.get(phone.id);
          if (
            original &&
            (original.label !== phone.label ||
              original.number !== phone.number ||
              original.sortOrder !== phone.sortOrder)
          ) {
            // Update existing phone
            await fetch(`/api/markets/${id}/phones/${phone.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          }
        }
      }

      // Delete removed phones
      for (const original of originalPhones) {
        if (!currentById.has(original.id)) {
          await fetch(`/api/markets/${id}/phones/${original.id}`, {
            method: 'DELETE',
          });
        }
      }

      router.push(`/stations/${id}`);
      router.refresh();
    } catch (err) {
      setError('Failed to save changes');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updatePhone = (index: number, field: 'label' | 'number', value: string) => {
    setPhones((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addPhone = () => {
    if (phones.length >= 4) return;
    setPhones((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, label: '', number: '', sortOrder: prev.length + 1 },
    ]);
  };

  const removePhone = (index: number) => {
    if (phones.length <= 1) return;
    setPhones((prev) => prev.filter((_, i) => i !== index));
  };

  const getFeedColor = (feed: Feed) => {
    switch (feed) {
      case '3pm': return '#D4A574';
      case '5pm': return '#7BA39B';
      case '6pm': return '#8B8BB8';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Station not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showBack title={`Edit ${station.callLetters}`} />
      
      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Station Info */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Station Info
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call Letters
              </label>
              <input
                type="text"
                value={callLetters}
                onChange={(e) => setCallLetters(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Market Name
              </label>
              <input
                type="text"
                value={marketName}
                onChange={(e) => setMarketName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feed
              </label>
              <div className="flex gap-2">
                {(['3pm', '5pm', '6pm'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFeed(f)}
                    className={`flex-1 py-2 rounded-xl transition-all text-xs font-bold ${
                      feed === f
                        ? 'text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={feed === f ? { backgroundColor: getFeedColor(f) } : {}}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={broadcastStatus || ''}
                onChange={(e) => setBroadcastStatus(e.target.value || null)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">None</option>
                <option value="live">LIVE</option>
                <option value="rerack">RERACK</option>
                <option value="might">MIGHT</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Air Time (Local)
              </label>
              <input
                type="text"
                value={airTimeLocal}
                onChange={(e) => setAirTimeLocal(e.target.value)}
                placeholder="3:00 PM"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Air Time (ET)
              </label>
              <input
                type="text"
                value={airTimeET}
                onChange={(e) => setAirTimeET(e.target.value)}
                placeholder="4:00 PM"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">
              Phone Numbers
            </h2>
            {phones.length < 4 && (
              <button
                onClick={addPhone}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Phone
              </button>
            )}
          </div>

          <div className="space-y-4">
            {phones.map((phone, index) => (
              <div key={phone.id} className="flex gap-3 items-start">
                <div className="flex-1 grid gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    value={phone.label}
                    onChange={(e) => updatePhone(index, 'label', e.target.value)}
                    placeholder="Contact name"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    value={formatDisplay(phone.number)}
                    onChange={(e) => updatePhone(index, 'number', e.target.value)}
                    placeholder="Phone number"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                </div>
                {phones.length > 1 && (
                  <button
                    onClick={() => removePhone(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Remove phone"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
