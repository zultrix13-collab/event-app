import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/features/services/providers/services_provider.dart';

class WalletScreen extends ConsumerWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final walletAsync = ref.watch(walletProvider);
    final txAsync = ref.watch(walletTransactionsProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Хэтэвч')),
      body: Column(
        children: [
          // Balance Card
          walletAsync.when(
            loading: () => const Padding(
              padding: EdgeInsets.all(24),
              child: CircularProgressIndicator(),
            ),
            error: (e, _) => Padding(
              padding: const EdgeInsets.all(24),
              child: Text('Алдаа: $e'),
            ),
            data: (wallet) => Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    theme.colorScheme.primary,
                    theme.colorScheme.primaryContainer,
                  ],
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Үлдэгдэл',
                    style: TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    wallet != null
                        ? '₮${wallet.balance.toStringAsFixed(0)}'
                        : '₮0',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 36,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () => context.go('/services/wallet/topup'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white54),
                      ),
                      child: const Text('QPay-аар цэнэглэх'),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Transaction list
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Text(
                  'Гүйлгээний түүх',
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: txAsync.when(
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Алдаа: $e')),
              data: (txs) => txs.isEmpty
                  ? const Center(child: Text('Гүйлгээ байхгүй'))
                  : ListView.builder(
                      itemCount: txs.length,
                      itemBuilder: (context, i) {
                        final tx = txs[i];
                        final isCredit = tx.type == 'topup' || tx.amount > 0;
                        return ListTile(
                          leading: CircleAvatar(
                            backgroundColor: isCredit
                                ? Colors.green.shade100
                                : Colors.red.shade100,
                            child: Icon(
                              isCredit
                                  ? Icons.arrow_downward
                                  : Icons.arrow_upward,
                              color: isCredit ? Colors.green : Colors.red,
                            ),
                          ),
                          title: Text(
                              tx.description ?? _txTypeLabel(tx.type)),
                          subtitle: Text(
                            '${tx.createdAt.year}-${tx.createdAt.month.toString().padLeft(2, '0')}-${tx.createdAt.day.toString().padLeft(2, '0')}',
                          ),
                          trailing: Text(
                            '${isCredit ? '+' : '-'}₮${tx.amount.abs().toStringAsFixed(0)}',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: isCredit ? Colors.green : Colors.red,
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }

  String _txTypeLabel(String type) {
    switch (type) {
      case 'topup':
        return 'Цэнэглэлт';
      case 'payment':
        return 'Төлбөр';
      case 'refund':
        return 'Буцаалт';
      default:
        return type;
    }
  }
}
