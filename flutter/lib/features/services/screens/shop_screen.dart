import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/features/services/models/product.dart';
import 'package:event_app/features/services/providers/cart_provider.dart';
import 'package:event_app/features/services/providers/services_provider.dart';

class ShopScreen extends ConsumerWidget {
  const ShopScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final products = ref.watch(productsProvider);
    final selectedCategory = ref.watch(selectedCategoryProvider);
    final itemCount = ref.watch(cartItemCountProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Дэлгүүр'),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart_outlined),
                onPressed: () => context.go('/services/cart'),
              ),
              if (itemCount > 0)
                Positioned(
                  right: 6,
                  top: 6,
                  child: CircleAvatar(
                    radius: 9,
                    backgroundColor: Theme.of(context).colorScheme.error,
                    child: Text(
                      '$itemCount',
                      style: const TextStyle(fontSize: 11, color: Colors.white),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // Category filter chips
          SizedBox(
            height: 52,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: [
                _CategoryChip(
                  label: 'Бүгд',
                  selected: selectedCategory == null,
                  onTap: () =>
                      ref.read(selectedCategoryProvider.notifier).state = null,
                ),
                _CategoryChip(
                  label: 'Бараа',
                  selected: selectedCategory == ProductCategory.merchandise,
                  onTap: () => ref
                      .read(selectedCategoryProvider.notifier)
                      .state = ProductCategory.merchandise,
                ),
                _CategoryChip(
                  label: 'Хоол',
                  selected: selectedCategory == ProductCategory.food,
                  onTap: () => ref
                      .read(selectedCategoryProvider.notifier)
                      .state = ProductCategory.food,
                ),
                _CategoryChip(
                  label: 'Тасалбар',
                  selected: selectedCategory == ProductCategory.ticket,
                  onTap: () => ref
                      .read(selectedCategoryProvider.notifier)
                      .state = ProductCategory.ticket,
                ),
              ],
            ),
          ),
          // Product grid
          Expanded(
            child: products.when(
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Алдаа гарлаа: $e')),
              data: (list) => list.isEmpty
                  ? const Center(child: Text('Бараа олдсонгүй'))
                  : GridView.builder(
                      padding: const EdgeInsets.all(16),
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.72,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      itemCount: list.length,
                      itemBuilder: (context, i) =>
                          _ProductCard(product: list[i]),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _CategoryChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
      ),
    );
  }
}

class _ProductCard extends ConsumerWidget {
  final Product product;

  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _showDetail(context, ref),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: product.imageUrl != null
                  ? CachedNetworkImage(
                      imageUrl: product.imageUrl!,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      errorWidget: (_, __, ___) =>
                          const Icon(Icons.image_not_supported),
                    )
                  : Container(
                      color: theme.colorScheme.surfaceContainerHighest,
                      child: const Center(
                          child: Icon(Icons.shopping_bag_outlined, size: 40)),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: theme.textTheme.bodyMedium
                        ?.copyWith(fontWeight: FontWeight.bold),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '₮${product.price.toStringAsFixed(0)}',
                    style: TextStyle(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showDetail(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => _ProductDetailSheet(product: product, ref: ref),
    );
  }
}

class _ProductDetailSheet extends StatelessWidget {
  final Product product;
  final WidgetRef ref;

  const _ProductDetailSheet({required this.product, required this.ref});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.6,
      builder: (_, controller) => SingleChildScrollView(
        controller: controller,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (product.imageUrl != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: CachedNetworkImage(
                    imageUrl: product.imageUrl!,
                    height: 200,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
              const SizedBox(height: 16),
              Text(product.name, style: theme.textTheme.headlineSmall),
              const SizedBox(height: 8),
              Text(
                '₮${product.price.toStringAsFixed(0)}',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.primary,
                ),
              ),
              if (product.description != null) ...[
                const SizedBox(height: 12),
                Text(product.description!),
              ],
              const SizedBox(height: 8),
              Text('Үлдэгдэл: ${product.stockCount} ширхэг',
                  style: theme.textTheme.bodySmall),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: product.stockCount > 0
                      ? () {
                          ref.read(cartProvider.notifier).addItem(product);
                          Navigator.of(context).pop();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content:
                                  Text('${product.name} сагсанд нэмэгдлээ'),
                            ),
                          );
                        }
                      : null,
                  icon: const Icon(Icons.add_shopping_cart),
                  label: const Text('Сагсанд нэмэх'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
