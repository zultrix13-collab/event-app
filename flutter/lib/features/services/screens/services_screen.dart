import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ServicesScreen extends StatelessWidget {
  const ServicesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Үйлчилгээ')),
      body: GridView.count(
        crossAxisCount: 2,
        padding: const EdgeInsets.all(16),
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        children: const [
          _ServiceCard(
            icon: '🛍️',
            label: 'Дэлгүүр',
            route: '/services/shop',
          ),
          _ServiceCard(
            icon: '💳',
            label: 'Хэтэвч',
            route: '/services/wallet',
          ),
          _ServiceCard(
            icon: '🚗',
            label: 'Тээвэр',
            route: '/services/transport',
          ),
          _ServiceCard(
            icon: '🍽️',
            label: 'Ресторан',
            route: '/services/restaurant',
          ),
          _ServiceCard(
            icon: '🏨',
            label: 'Зочид буудал',
            route: '/services/hotel',
          ),
          _ServiceCard(
            icon: '🔍',
            label: 'Олдвор/гээдэг',
            route: '/services/lost-found',
          ),
        ],
      ),
    );
  }
}

class _ServiceCard extends StatelessWidget {
  final String icon;
  final String label;
  final String route;

  const _ServiceCard({
    required this.icon,
    required this.label,
    required this.route,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: theme.colorScheme.surfaceContainerHighest,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => context.go(route),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(icon, style: const TextStyle(fontSize: 40)),
            const SizedBox(height: 12),
            Text(
              label,
              style: theme.textTheme.titleMedium
                  ?.copyWith(fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
