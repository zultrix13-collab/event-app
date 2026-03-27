'use client';

import { useState } from 'react';
import { updateItemStatus } from '@/modules/services/actions';
import type { LostFoundItem } from '@/modules/services/types';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open: { label: 'Нээлттэй', color: 'bg-yellow-100 text-yellow-800' },
  resolved: { label: 'Шийдвэрлэсэн', color: 'bg-green-100 text-green-800' },
  closed: { label: 'Хаасан', color: 'bg-gray-100 text-gray-800' },
};

const TYPE_CONFIG = {
  lost: { label: 'Алдсан', color: 'bg-red-100 text-red-700' },
  found: { label: 'Олдсон', color: 'bg-green-100 text-green-700' },
};

interface Props {
  items: (LostFoundItem & { reporter: { full_name: string | null; email: string } | null })[];
}

export default function LostFoundAdminClient({ items: initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleAction(itemId: string, status: string) {
    setProcessing(itemId);
    const result = await updateItemStatus(itemId, status);
    if (result.success) {
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, status: status as LostFoundItem['status'] } : item))
      );
    } else {
      alert(result.error ?? 'Алдаа гарлаа');
    }
    setProcessing(null);
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <p className="text-3xl mb-2">📭</p>
        <p className="text-gray-400">Зүйл байхгүй байна</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.open;
        const typeCfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.lost;

        return (
          <div key={item.id} className="bg-white border rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeCfg.color}`}>
                      {typeCfg.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">{item.item_name}</p>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                  )}
                  {item.last_seen_location && (
                    <p className="text-xs text-gray-400 mt-1">📍 {item.last_seen_location}</p>
                  )}
                  {item.contact_info && (
                    <p className="text-xs text-blue-500 mt-0.5">📞 {item.contact_info}</p>
                  )}
                  {item.reporter && (
                    <p className="text-xs text-gray-400 mt-1">
                      Мэдэгдэгч: {item.reporter.full_name ?? item.reporter.email}
                    </p>
                  )}
                  <p className="text-xs text-gray-300 mt-1">
                    {new Date(item.created_at).toLocaleDateString('mn-MN', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {item.status === 'open' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAction(item.id, 'resolved')}
                  disabled={processing === item.id}
                  className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 disabled:opacity-50"
                >
                  ✓ Шийдвэрлэх
                </button>
                <button
                  onClick={() => handleAction(item.id, 'closed')}
                  disabled={processing === item.id}
                  className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-medium hover:bg-gray-600 disabled:opacity-50"
                >
                  ✕ Хаах
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
