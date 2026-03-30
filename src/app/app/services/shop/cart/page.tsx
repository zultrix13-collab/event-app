'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkoutCartAction } from '@/modules/services/checkout';
import type { CartItem } from '@/modules/services/types';

const CART_KEY = 'event_app_cart';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setMounted(true);
  }, []);

  const updateQuantity = (productId: string, delta: number) => {
    const updated = cart
      .map((i) =>
        i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i
      )
      .filter((i) => i.quantity > 0);
    setCart(updated);
    saveCart(updated);
  };

  const removeItem = (productId: string) => {
    const updated = cart.filter((i) => i.product.id !== productId);
    setCart(updated);
    saveCart(updated);
  };

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError('');

    const items = cart.map((i) => ({
      productId: i.product.id,
      productName: i.product.name,
      quantity: i.quantity,
      unitPrice: i.product.price,
    }));

    const result = await checkoutCartAction(items, total);
    setLoading(false);

    if (result.success && result.orderId) {
      // Clear cart
      localStorage.removeItem(CART_KEY);
      setCart([]);
      router.push(`/app/services/shop/orders?new=${result.orderId}`);
    } else {
      setError(result.error ?? 'Худалдан авалт амжилтгүй боллоо');
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/services/shop" className="text-blue-600 text-sm">← Буцах</Link>
        <h1 className="text-xl font-bold text-gray-900">🛒 Сагс</h1>
        {cart.length > 0 && (
          <span className="ml-auto text-sm text-gray-400">{cart.length} төрөл</span>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <p className="text-5xl mb-3">🛒</p>
          <p className="font-semibold text-gray-700">Сагс хоосон байна</p>
          <p className="text-sm text-gray-400 mt-1">Бараа нэмж эхлээрэй</p>
          <Link
            href="/app/services/shop"
            className="mt-4 inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
          >
            🛍️ Дэлгүүр руу очих
          </Link>
        </div>
      ) : (
        <>
          {/* Cart items */}
          <div className="space-y-3 mb-6">
            {cart.map((item) => (
              <div key={item.product.id} className="bg-white rounded-2xl border p-4 flex items-center gap-3 shadow-sm">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.product.name}</p>
                  <p className="text-xs text-blue-600 font-medium">
                    ₮{Number(item.product.price).toLocaleString()} × {item.quantity}
                  </p>
                  <p className="text-xs text-gray-400 font-semibold">
                    = ₮{(item.product.price * item.quantity).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-sm hover:bg-gray-200"
                  >−</button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-sm hover:bg-gray-200"
                  >+</button>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="w-7 h-7 text-red-400 hover:text-red-600 ml-1 flex items-center justify-center"
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border p-4 mb-4 shadow-sm">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Нийт барааны тоо:</span>
              <span>{cart.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Нийт дүн:</span>
              <span className="text-blue-600">₮{total.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-xl">
              <span className="text-lg">💳</span>
              <div>
                <p className="text-xs font-semibold text-blue-800">Хэтэвчээр төлөх</p>
                <p className="text-xs text-blue-600">Хэтэвчнээс суутгагдана</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-base disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Боловсруулж байна...' : `💳 ₮${total.toLocaleString()} төлөх`}
          </button>

          <Link
            href="/app/services/shop"
            className="block text-center text-sm text-gray-400 mt-3 hover:text-gray-600"
          >
            Дэлгүүрт буцах
          </Link>
        </>
      )}
    </div>
  );
}
