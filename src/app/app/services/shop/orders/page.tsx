'use client';

import { useState, useEffect } from 'react';
import { getUserOrders } from '@/modules/services/actions';
import type { Order } from '@/modules/services/types';
import Link from 'next/link';

const STATUS_CONFIG = {
  pending: { label: 'Хүлээгдэж буй', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Төлөгдсөн', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Цуцалсан', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Буцаалт', color: 'bg-gray-100 text-gray-800' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getUserOrders().then((result) => {
      if (result.success && result.data) {
        setOrders(result.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/services/shop" className="text-blue-600 text-sm">← Буцах</Link>
        <h1 className="text-xl font-bold text-gray-900">Захиалгын түүх</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-20" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📋</p>
          <p>Захиалга байхгүй байна</p>
          <Link href="/app/services/shop" className="mt-4 inline-block text-blue-600 text-sm">
            Дэлгүүр руу очих →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const isExpanded = expanded === order.id;

            return (
              <div key={order.id} className="bg-white rounded-xl border overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Захиалга #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('mn-MN', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                    <span className="text-blue-600 font-bold text-sm">
                      ₮{Number(order.total_amount).toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {isExpanded && order.order_items && (
                  <div className="border-t px-4 py-3 bg-gray-50">
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.product_name} × {item.quantity}
                          </span>
                          <span className="text-gray-900 font-medium">
                            ₮{Number(item.total_price).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    {order.payment_method && (
                      <p className="text-xs text-gray-500 mt-2">
                        Төлбөр: {order.payment_method}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
