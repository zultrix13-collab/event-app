import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:event_app/features/services/models/vendor.dart';
import 'package:event_app/features/services/providers/services_provider.dart';

class VendorScreen extends ConsumerStatefulWidget {
  const VendorScreen({super.key});

  @override
  ConsumerState<VendorScreen> createState() => _VendorScreenState();
}

class _VendorScreenState extends ConsumerState<VendorScreen> {
  String? _selectedCategory;

  static const _categories = [
    (value: null, label: 'Бүгд'),
    (value: 'general', label: 'Ерөнхий'),
    (value: 'food', label: 'Хоол'),
    (value: 'merchandise', label: 'Бараа'),
    (value: 'service', label: 'Үйлчилгээ'),
  ];

  @override
  Widget build(BuildContext context) {
    final vendorsAsync = ref.watch(vendorsProvider(_selectedCategory));

    return Scaffold(
      appBar: AppBar(title: const Text('Дэлгүүрүүд')),
      body: Column(
        children: [
          // Category filter
          SizedBox(
            height: 48,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, i) {
                final cat = _categories[i];
                final isSelected = _selectedCategory == cat.value;
                return FilterChip(
                  label: Text(cat.label),
                  selected: isSelected,
                  onSelected: (_) =>
                      setState(() => _selectedCategory = cat.value),
                );
              },
            ),
          ),

          // Vendor list
          Expanded(
            child: vendorsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Алдаа: $e')),
              data: (vendors) => vendors.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.store_outlined,
                              size: 64, color: Colors.grey),
                          SizedBox(height: 12),
                          Text('Дэлгүүр байхгүй байна',
                              style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.all(16),
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 0.85,
                      ),
                      itemCount: vendors.length,
                      itemBuilder: (context, i) =>
                          _VendorCard(vendor: vendors[i]),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _VendorCard extends StatelessWidget {
  final Vendor vendor;
  const _VendorCard({required this.vendor});

  static const _categoryIcons = {
    'general': '🏪',
    'food': '🍽️',
    'merchandise': '🎁',
    'service': '🔧',
  };

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _showDetail(context),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo / icon
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                clipBehavior: Clip.antiAlias,
                child: vendor.logoUrl != null
                    ? CachedNetworkImage(
                        imageUrl: vendor.logoUrl!,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => Center(
                          child: Text(
                            _categoryIcons[vendor.category] ?? '🏪',
                            style: const TextStyle(fontSize: 24),
                          ),
                        ),
                      )
                    : Center(
                        child: Text(
                          _categoryIcons[vendor.category] ?? '🏪',
                          style: const TextStyle(fontSize: 24),
                        ),
                      ),
              ),
              const SizedBox(height: 10),
              Text(
                vendor.name,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                    fontWeight: FontWeight.bold, fontSize: 13),
              ),
              if (vendor.boothNumber != null) ...[
                const SizedBox(height: 4),
                Text(
                  'Стенд ${vendor.boothNumber}',
                  style: TextStyle(
                    fontSize: 11,
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  void _showDetail(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _VendorDetailSheet(vendor: vendor),
    );
  }
}

class _VendorDetailSheet extends StatelessWidget {
  final Vendor vendor;
  const _VendorDetailSheet({required this.vendor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              if (vendor.logoUrl != null)
                Container(
                  width: 52,
                  height: 52,
                  margin: const EdgeInsets.only(right: 12),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: CachedNetworkImage(
                    imageUrl: vendor.logoUrl!,
                    fit: BoxFit.cover,
                  ),
                ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      vendor.name,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    if (vendor.nameEn != null)
                      Text(vendor.nameEn!,
                          style: const TextStyle(
                              color: Colors.grey, fontSize: 13)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (vendor.boothNumber != null)
            _DetailRow(icon: Icons.location_on, text: 'Стенд ${vendor.boothNumber}'),

          if (vendor.description != null) ...[
            const SizedBox(height: 8),
            Text(vendor.description!,
                style: const TextStyle(color: Colors.grey, fontSize: 13)),
          ],

          if (vendor.phone != null) ...[
            const SizedBox(height: 12),
            InkWell(
              onTap: () => launchUrl(Uri.parse('tel:${vendor.phone}')),
              child: _DetailRow(
                icon: Icons.phone,
                text: vendor.phone!,
                color: Colors.blue,
              ),
            ),
          ],

          if (vendor.website != null) ...[
            const SizedBox(height: 8),
            InkWell(
              onTap: () => launchUrl(Uri.parse(vendor.website!),
                  mode: LaunchMode.externalApplication),
              child: _DetailRow(
                icon: Icons.language,
                text: vendor.website!,
                color: Colors.blue,
              ),
            ),
          ],

          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Хаах'),
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color? color;

  const _DetailRow({required this.icon, required this.text, this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: color ?? Colors.grey),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              color: color,
              fontSize: 13,
            ),
          ),
        ),
      ],
    );
  }
}
