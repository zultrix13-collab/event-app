import { createClient } from '@/lib/supabase/server';
import type { Wallet, WalletTransaction } from '@/modules/services/types';
import Link from 'next/link';

const TX_TYPE_CONFIG: Record<string, { label: string; color: string; sign: string; icon: string; iconBg: string }> = {
  topup: {
    label: 'Цэнэглэлт',
    color: 'text-green-600',
    sign: '+',
    icon: '💳',
    iconBg: 'bg-green-100',
  },
  purchase: {
    label: 'Худалдан авалт',
    color: 'text-red-500',
    sign: '-',
    icon: '🛍️',
    iconBg: 'bg-red-50',
  },
  refund: {
    label: 'Буцаалт',
    color: 'text-blue-500',
    sign: '+',
    icon: '↩️',
    iconBg: 'bg-blue-50',
  },
  transfer: {
    label: 'Шилжүүлэг',
    color: 'text-gray-600',
    sign: '→',
    icon: '↔️',
    iconBg: 'bg-gray-100',
  },
};

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <p className="text-3xl mb-2">🔒</p>
        <p className="font-semibold text-red-700">Нэвтрэх шаардлагатай</p>
        <Link href="/login" className="mt-3 inline-block text-red-600 text-sm hover:underline">
          Нэвтрэх →
        </Link>
      </div>
    </div>
  );

  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: Wallet | null };

  const transactions: WalletTransaction[] = [];

  if (wallet) {
    const { data: txs } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (txs) transactions.push(...(txs as WalletTransaction[]));
  }

  const balance = wallet ? Number(wallet.balance) : 0;

  // Compute totals
  const totalIn = transactions
    .filter((t) => t.type === 'topup' || t.type === 'refund')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalOut = transactions
    .filter((t) => t.type === 'purchase')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="max-w-md mx-auto p-4 space-y-5">
      {/* Balance card — gradient green */}
      <div className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-3xl p-6 text-white shadow-xl shadow-green-200">
        <p className="text-green-200 text-sm font-medium mb-1">Таны үлдэгдэл</p>
        <div className="flex items-end gap-2 mb-1">
          <span className="text-green-200 text-2xl font-light">₮</span>
          <span className="text-5xl font-black tracking-tight">{balance.toLocaleString()}</span>
        </div>
        <p className="text-green-300 text-sm">{wallet?.currency ?? 'MNT'}</p>

        {/* Mini stats */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
            <p className="text-green-200 text-xs font-medium">Нийт орлого</p>
            <p className="text-white font-bold text-lg mt-0.5">+₮{totalIn.toLocaleString()}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
            <p className="text-green-200 text-xs font-medium">Нийт зарлага</p>
            <p className="text-white font-bold text-lg mt-0.5">-₮{totalOut.toLocaleString()}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href="/app/wallet/topup"
            className="flex items-center justify-center gap-2 bg-white text-green-700 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-green-50 transition-colors"
          >
            💳 Цэнэглэх
          </Link>
          <Link
            href="/app/services/shop"
            className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white py-3 rounded-2xl text-sm font-semibold transition-colors"
          >
            🛍️ Дэлгүүр
          </Link>
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 text-lg">Гүйлгээний түүх</h2>
          {transactions.length > 0 && (
            <span className="text-xs text-gray-400">{transactions.length} гүйлгээ</span>
          )}
        </div>

        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl border p-10 text-center shadow-sm">
            <p className="text-4xl mb-3">💳</p>
            <p className="font-semibold text-gray-700">Гүйлгээ байхгүй байна</p>
            <p className="text-gray-400 text-sm mt-1">Хэтэвч цэнэглэвэл гүйлгээ харагдана</p>
            <Link href="/app/wallet/topup" className="mt-4 inline-flex items-center gap-1 bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors">
              💳 Цэнэглэх →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const cfg = TX_TYPE_CONFIG[tx.type] ?? TX_TYPE_CONFIG.purchase;
              const isPositive = cfg.sign === '+';
              return (
                <div key={tx.id} className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                  {/* Type icon */}
                  <div className={`w-11 h-11 ${cfg.iconBg} rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm`}>
                    {cfg.icon}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{cfg.label}</p>
                    {tx.description && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{tx.description}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString('mn-MN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className={`font-black text-base ${cfg.color}`}>
                      {cfg.sign}₮{Number(tx.amount).toLocaleString()}
                    </p>
                    {isPositive && (
                      <p className="text-xs text-gray-300 mt-0.5">орлого</p>
                    )}
                    {!isPositive && (
                      <p className="text-xs text-gray-300 mt-0.5">зарлага</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
