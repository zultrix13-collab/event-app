import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';
import 'package:event_app/features/services/providers/cart_provider.dart';
import 'package:event_app/features/services/providers/services_provider.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  String _paymentMethod = 'wallet';
  bool _loading = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final total = ref.watch(cartTotalProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Сагс')),
      body: cart.isEmpty
          ? const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.shopping_cart_outlined, size: 72, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('Сагс хоосон байна',
                      style: TextStyle(color: Colors.grey)),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: cart.length,
                    itemBuilder: (context, i) {
                      final item = cart[i];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor:
                              Theme.of(context).colorScheme.primaryContainer,
                          child: Text(
                            item.quantity.toString(),
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                        title: Text(item.product.name),
                        subtitle: Text(
                            '₮${item.product.price.toStringAsFixed(0)} × ${item.quantity}'),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove),
                              onPressed: () => ref
                                  .read(cartProvider.notifier)
                                  .updateQuantity(
                                      item.product.id, item.quantity - 1),
                            ),
                            Text('${item.quantity}'),
                            IconButton(
                              icon: const Icon(Icons.add),
                              onPressed: () => ref
                                  .read(cartProvider.notifier)
                                  .updateQuantity(
                                      item.product.id, item.quantity + 1),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Нийт дүн:',
                              style: TextStyle(fontWeight: FontWeight.bold)),
                          Text(
                            '₮${total.toStringAsFixed(0)}',
                            style: const TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 18),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Text('Төлбөрийн хэлбэр:'),
                      RadioListTile<String>(
                        value: 'wallet',
                        groupValue: _paymentMethod,
                        onChanged: (v) =>
                            setState(() => _paymentMethod = v!),
                        title: const Text('💳 Хэтэвч'),
                        dense: true,
                      ),
                      RadioListTile<String>(
                        value: 'qpay',
                        groupValue: _paymentMethod,
                        onChanged: (v) =>
                            setState(() => _paymentMethod = v!),
                        title: const Text('📱 QPay'),
                        dense: true,
                      ),
                      if (_error != null) ...[
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.red.shade200),
                          ),
                          child: Text(
                            '⚠️ $_error',
                            style: TextStyle(
                                color: Colors.red.shade700, fontSize: 13),
                          ),
                        ),
                      ],
                      const SizedBox(height: 12),
                      FilledButton(
                        onPressed:
                            _loading ? null : () => _placeOrder(context),
                        child: _loading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.white),
                              )
                            : const Text('Захиалах'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Future<void> _placeOrder(BuildContext context) async {
    setState(() { _loading = true; _error = null; });
    try {
      final cart = ref.read(cartProvider);
      final total = ref.read(cartTotalProvider);

      if (_paymentMethod == 'wallet') {
        // Wallet ACID deduction via RPC
        final userId =
            Supabase.instance.client.auth.currentUser?.id;
        if (userId == null) throw Exception('Нэвтрэч орно уу');

        final idempotencyKey = const Uuid().v4();
        final description = cart
            .map((e) => '${e.product.name}×${e.quantity}')
            .join(', ');

        final response = await Supabase.instance.client.rpc(
          'wallet_transfer',
          params: {
            'p_user_id': userId,
            'p_amount': total,
            'p_type': 'purchase',
            'p_idempotency_key': 'purchase:$idempotencyKey',
            'p_description': 'Захиалга: $description',
          },
        );

        final rpcResult = response as Map<String, dynamic>?;
        if (rpcResult?['success'] != true) {
          final msg = rpcResult?['error'] as String? ?? 'Гүйлгээ амжилтгүй боллоо';
          setState(() => _error = msg.toLowerCase().contains('insufficient')
              ? 'Хэтэвчний үлдэгдэл хүрэлцэхгүй байна'
              : msg);
          return;
        }

        // Create order
        final repo = ref.read(servicesRepositoryProvider);
        final items = cart
            .map((e) => {
                  'product_id': e.product.id,
                  'product_name': e.product.name,
                  'quantity': e.quantity,
                  'unit_price': e.product.price,
                })
            .toList();

        final order = await repo.createOrder(items, _paymentMethod);
        ref.read(cartProvider.notifier).clear();
        ref.invalidate(myOrdersProvider);
        ref.invalidate(walletProvider);
        ref.invalidate(walletTransactionsProvider);

        if (context.mounted) {
          context.go('/services/shop/order-confirmation/${order.id}');
        }
      } else {
        // QPay: legacy flow
        final repo = ref.read(servicesRepositoryProvider);
        final items = cart
            .map((e) => {
                  'product_id': e.product.id,
                  'product_name': e.product.name,
                  'quantity': e.quantity,
                  'unit_price': e.product.price,
                })
            .toList();

        final order = await repo.createOrder(items, _paymentMethod);
        ref.read(cartProvider.notifier).clear();
        ref.invalidate(myOrdersProvider);

        if (context.mounted) {
          context.go('/services/shop/order-confirmation/${order.id}');
        }
      }
    } catch (e) {
      final msg = e.toString();
      setState(() => _error = msg.contains('insufficient')
          ? 'Хэтэвчний үлдэгдэл хүрэлцэхгүй байна'
          : 'Алдаа: $msg');
    } finally {
      setState(() => _loading = false);
    }
  }
}
