'use client';

import { useState, useEffect } from 'react';
import { reportLostItem, getOpenItems } from '@/modules/services/actions';
import type { LostFoundItem } from '@/modules/services/types';
import Link from 'next/link';

export default function LostFoundPage() {
  const [activeTab, setActiveTab] = useState<'report' | 'found'>('report');
  const [foundItems, setFoundItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');

  useEffect(() => {
    if (activeTab === 'found') {
      setLoading(true);
      getOpenItems('found').then((r) => {
        if (r.success && r.data) setFoundItems(r.data);
        setLoading(false);
      });
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await reportLostItem({
      type: 'lost',
      item_name: itemName,
      description: description || undefined,
      last_seen_location: location || undefined,
      contact_info: contact || undefined,
    });

    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
      setItemName('');
      setDescription('');
      setLocation('');
      setContact('');
    } else {
      alert(result.error ?? 'Мэдэгдэл илгээхэд алдаа гарлаа');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/app/services" className="text-blue-600 text-sm">← Буцах</Link>
        <h1 className="text-xl font-bold text-gray-900">🔍 Алдсан/Олдсон зүйл</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'report' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          🔴 Алдсан зүйл мэдэгдэх
        </button>
        <button
          onClick={() => setActiveTab('found')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'found' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          🟢 Олдсон зүйлс харах
        </button>
      </div>

      {/* Report form */}
      {activeTab === 'report' && (
        <div>
          {submitted && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex gap-3">
              <span className="text-green-500 text-xl">✅</span>
              <div>
                <p className="font-medium text-green-800">Мэдэгдэл илгээгдлээ</p>
                <p className="text-sm text-green-600">Манай баг тантай холбогдох болно.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Зүйлийн нэр *</label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Жишээ: Цагаан өнгийн цүнх"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Тодорхойлолт</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Зүйлийн дэлгэрэнгүй мэдээлэл..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Сүүлд харсан байршил</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Жишээ: A Hall, 3-р давхар"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Холбоо барих</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Утасны дугаар эсвэл имэйл"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-3 border border-dashed border-gray-300 text-center">
              <p className="text-sm text-gray-400">📷 Зураг оруулах (удахгүй)</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50"
            >
              {submitting ? 'Илгээж байна...' : 'Мэдэгдэл илгээх'}
            </button>
          </form>
        </div>
      )}

      {/* Found items */}
      {activeTab === 'found' && (
        <div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-20" />
              ))}
            </div>
          ) : foundItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-gray-500">Олдсон зүйл байхгүй байна</p>
            </div>
          ) : (
            <div className="space-y-3">
              {foundItems.map((item) => (
                <div key={item.id} className="bg-white border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🟢</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.item_name}</p>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                      )}
                      {item.last_seen_location && (
                        <p className="text-xs text-gray-400 mt-1">📍 {item.last_seen_location}</p>
                      )}
                      {item.contact_info && (
                        <p className="text-xs text-blue-500 mt-1">📞 {item.contact_info}</p>
                      )}
                      <p className="text-xs text-gray-300 mt-1">
                        {new Date(item.created_at).toLocaleDateString('mn-MN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
