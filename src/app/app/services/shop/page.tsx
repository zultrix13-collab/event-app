'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProducts, createOrder } from '@/modules/services/actions';
import type { Product, CartItem } from '@/modules/services/types';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'all', label: 'Бүгд' },
  { value: 'merchandise', label: 'Сувенир' },
  { value: 'food', label: 'Хоол' },
  { value: 'ticket', label: 'Тасалбар' },
  { value: 'other', label: 'Бусад' },
];

export default function ShopPage() {
  const [category, setCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'qpay'>('wallet');
  const [checkoutStep, setCheckoutStep] = useState<'browse' | 'checkout' | 'confirmed'>('browse');
  const [orderResult, setOrderResult] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const result = await getProducts(category === 'all' ? undefined : category);
    if (result.success && result.data) {
      setProducts(result.data);
    }
    setLoading(false);
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = async () => {
    setSubmitting(true);
    const result = await createOrder({
      items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      paymentMethod,
    });
    setSubmitting(false);

    if (result.success) {
      setCart([]);
      setCartOpen(false);
      setCheckoutStep('confirmed');
      setOrderResult(result.data?.id ?? null);
    } else {
      alert(result.error ?? 'Захиалга үүсгэхэд алдаа гарлаа');
    }
  };

  if (checkoutStep === 'confirmed') {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Захиалга амжилттай!</h2>
        <p className="text-gray-500 mb-6">Таны захиалга хүлээн авлаа.</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/app/services/shop/orders"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            Захиалга харах
          </Link>
          <button
            onClick={() => setCheckoutStep('browse')}
            className="px-4 py-2 border rounded-lg text-sm font-medium"
          >
            Буцах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">🛍️ Дэлгүүр</h1>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
        >
          🛒 Сагс
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              category === c.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-48" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📦</p>
          <p>Бараа байхгүй байна</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border p-3 flex flex-col">
              <div className="w-full h-32 bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-3xl">📦</span>
                )}
              </div>
              <p className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">{product.name}</p>
              <p className="text-blue-600 font-bold text-sm mb-2">
                ₮{Number(product.price).toLocaleString()}
              </p>
              {product.stock_count === 0 ? (
                <button disabled className="w-full py-1.5 bg-gray-100 text-gray-400 rounded-lg text-sm mt-auto">
                  Дуусгавар
                </button>
              ) : (
                <button
                  onClick={() => addToCart(product)}
                  className="w-full py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors mt-auto"
                >
                  Сагсанд нэмэх
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="w-80 bg-white h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg">🛒 Сагс</h2>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Сагс хоосон байна</p>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.product.name}</p>
                      <p className="text-xs text-blue-600">₮{Number(item.product.price).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-6 h-6 bg-gray-100 rounded text-sm flex items-center justify-center"
                      >−</button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-6 h-6 bg-gray-100 rounded text-sm flex items-center justify-center"
                      >+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 text-sm">🗑️</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t space-y-3">
                <div className="flex justify-between font-bold">
                  <span>Нийт:</span>
                  <span className="text-blue-600">₮{cartTotal.toLocaleString()}</span>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Төлбөрийн арга:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentMethod('wallet')}
                      className={`flex-1 py-2 text-sm rounded-lg border font-medium ${
                        paymentMethod === 'wallet' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'
                      }`}
                    >
                      💳 Хэтэвч
                    </button>
                    <button
                      onClick={() => setPaymentMethod('qpay')}
                      className={`flex-1 py-2 text-sm rounded-lg border font-medium ${
                        paymentMethod === 'qpay' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'
                      }`}
                    >
                      QPay
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Боловсруулж байна...' : 'Захиалах'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
