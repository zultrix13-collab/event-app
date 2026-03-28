import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
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
                  Icon(Icons.shopping_cart_outlined, size: 72),
                  SizedBox(height: 16),
                  Text('Сагс хоосон байна'),
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
                          child: Text(item.quantity.toString()),
                        ),
                        title: Text(item.product.name),
                        subtitle: Text('₮${item.product.price.toStringAsFixed(0)}'),
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
                        onChanged: (v) => setState(() => _paymentMethod = v!),
                        title: const Text('💳 Хэтэвч'),
                        dense: true,
                      ),
                      RadioListTile<String>(
                        value: 'qpay',
                        groupValue: _paymentMethod,
                        onChanged: (v) => setState(() => _paymentMethod = v!),
                        title: const Text('📱 QPay'),
                        dense: true,
                      ),
                      const SizedBox(height: 8),
                      FilledButton(
                        onPressed: _loading ? null : () => _placeOrder(context),
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
    setState(() => _loading = true);
    try {
      final cart = ref.read(cartProvider);
      final repo = ref.read(servicesRepositoryProvider);
      final items = cart
          .map((e) => {
                'product_id': e.product.id,
                'product_name': e.product.name,
                'quantity': e.quantity,
                'unit_price': e.product.price,
              })
          .toList();

      await repo.createOrder(items, _paymentMethod);
      ref.read(cartProvider.notifier).clear();
      ref.invalidate(myOrdersProvider);

      if (context.mounted) {
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Захиалга амжилттай! 🎉'),
            content: const Text('Таны захиалга амжилттай баталгаажлаа.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  context.go('/services/shop');
                },
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Алдаа: $e')),
        );
      }
    } finally {
      setState(() => _loading = false);
    }
  }
}
