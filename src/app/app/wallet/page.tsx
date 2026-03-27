import { createClient } from '@/lib/supabase/server';
import type { Wallet, WalletTransaction } from '@/modules/services/types';
import Link from 'next/link';

const TX_TYPE_CONFIG: Record<string, { label: string; color: string; sign: string }> = {
  topup: { label: 'Цэнэглэлт', color: 'text-green-600', sign: '+' },
  purchase: { label: 'Худалдан авалт', color: 'text-red-500', sign: '-' },
  refund: { label: 'Буцаалт', color: 'text-blue-500', sign: '+' },
  transfer: { label: 'Шилжүүлэг', color: 'text-gray-600', sign: '→' },
};

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-4">Нэвтрэх шаардлагатай</div>;

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

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Balance card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <p className="text-sm text-blue-200 mb-1">Таны үлдэгдэл</p>
        <p className="text-4xl font-bold mb-1">
          ₮{wallet ? Number(wallet.balance).toLocaleString() : '0'}
        </p>
        <p className="text-blue-200 text-sm">{wallet?.currency ?? 'MNT'}</p>

        <div className="mt-4 flex gap-3">
          <Link
            href="/app/wallet/topup"
            className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
          >
            💳 Цэнэглэх
          </Link>
          <Link
            href="/app/services/shop"
            className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
          >
            🛍️ Дэлгүүр
          </Link>
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="font-semibold text-gray-800 mb-3">Гүйлгээний түүх</h2>

        {transactions.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <p className="text-3xl mb-2">💳</p>
            <p className="text-gray-400 text-sm">Гүйлгээ байхгүй байна</p>
            <Link href="/app/wallet/topup" className="mt-3 inline-block text-blue-600 text-sm hover:underline">
              Хэтэвч цэнэглэх →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const cfg = TX_TYPE_CONFIG[tx.type] ?? TX_TYPE_CONFIG.purchase;
              return (
                <div key={tx.id} className="bg-white border rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
                    {tx.type === 'topup' ? '💳' : tx.type === 'purchase' ? '🛍️' : tx.type === 'refund' ? '↩️' : '→'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{cfg.label}</p>
                    {tx.description && (
                      <p className="text-xs text-gray-400 truncate">{tx.description}</p>
                    )}
                    <p className="text-xs text-gray-300">
                      {new Date(tx.created_at).toLocaleDateString('mn-MN', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <p className={`font-bold text-sm ${cfg.color}`}>
                    {cfg.sign}₮{Number(tx.amount).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
