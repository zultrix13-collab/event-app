import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/features/services/models/order.dart';
import 'package:event_app/features/services/providers/services_provider.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(myOrdersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Миний захиалгууд'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/services/shop'),
        ),
      ),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Алдаа: $e')),
        data: (orders) => orders.isEmpty
            ? Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.receipt_long_outlined,
                        size: 72, color: Colors.grey),
                    const SizedBox(height: 16),
                    const Text('Захиалга байхгүй',
                        style: TextStyle(color: Colors.grey)),
                    const SizedBox(height: 12),
                    FilledButton(
                      onPressed: () => context.go('/services/shop'),
                      child: const Text('Дэлгүүр руу очих'),
                    ),
                  ],
                ),
              )
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: orders.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, i) => _OrderCard(order: orders[i]),
              ),
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;
  const _OrderCard({required this.order});

  static const _statusMap = {
    'pending': (label: 'Хүлээгдэж буй', icon: '⏳'),
    'paid': (label: 'Төлөгдсөн', icon: '✅'),
    'cancelled': (label: 'Цуцалсан', icon: '❌'),
    'refunded': (label: 'Буцаалт', icon: '↩️'),
  };

  @override
  Widget build(BuildContext context) {
    final status = _statusMap[order.status] ??
        (label: order.status, icon: '❓');
    final shortId = order.id.length >= 8
        ? order.id.substring(0, 8).toUpperCase()
        : order.id.toUpperCase();
    final dt = order.createdAt;
    final dateStr =
        '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')} '
        '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('#$shortId',
                    style: const TextStyle(fontWeight: FontWeight.bold)),
                Text('${status.icon} ${status.label}',
                    style: const TextStyle(fontSize: 12)),
              ],
            ),
            if (order.items.isNotEmpty) ...[
              const SizedBox(height: 8),
              ...order.items.map(
                (item) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('${item.productName} × ${item.quantity}',
                          style: const TextStyle(
                              fontSize: 13, color: Colors.grey)),
                      Text('₮${item.totalPrice.toStringAsFixed(0)}',
                          style: const TextStyle(fontSize: 13)),
                    ],
                  ),
                ),
              ),
            ],
            const Divider(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(dateStr,
                    style: const TextStyle(
                        fontSize: 12, color: Colors.grey)),
                Text('₮${order.totalAmount.toStringAsFixed(0)}',
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 15)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
