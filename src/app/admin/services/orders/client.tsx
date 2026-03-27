'use client';

import { useState } from 'react';
import type { Order } from '@/modules/services/types';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Хүлээгдэж буй', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Төлөгдсөн', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Цуцалсан', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Буцаалт', color: 'bg-gray-100 text-gray-800' },
};

type OrderWithUser = Order & {
  user: { full_name: string | null; email: string } | null;
};

interface Props {
  orders: OrderWithUser[];
}

export default function AdminOrdersClient({ orders }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <p className="text-3xl mb-2">📋</p>
        <p className="text-gray-400">Захиалга байхгүй байна</p>
      </div>
    );
  }

  const total = orders.reduce(
    (sum, o) => (o.status === 'paid' ? sum + Number(o.total_amount) : sum),
    0
  );

  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-700">
        Нийт {orders.length} захиалга · Төлөгдсөн нийт: ₮{total.toLocaleString()}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Захиалга</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Хэрэглэгч</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Огноо</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Статус</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Дүн</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Дэлгэрэнгүй</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              const isExpanded = expanded === order.id;

              return (
                <>
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      {order.user ? (
                        <div>
                          <p className="text-gray-800">{order.user.full_name ?? 'N/A'}</p>
                          <p className="text-xs text-gray-400">{order.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(order.created_at).toLocaleDateString('mn-MN', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ₮{Number(order.total_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : order.id)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        {isExpanded ? '▲ Хаах' : '▼ Харах'}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${order.id}-detail`} className="bg-gray-50">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="space-y-1 text-sm">
                          {order.order_items?.map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <span className="text-gray-700">
                                {item.product_name} × {item.quantity}
                              </span>
                              <span className="font-medium">₮{Number(item.total_price).toLocaleString()}</span>
                            </div>
                          ))}
                          {order.payment_method && (
                            <p className="text-xs text-gray-400 pt-1 border-t mt-1">
                              Төлбөр: {order.payment_method}
                              {order.payment_ref && ` · Ref: ${order.payment_ref}`}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
