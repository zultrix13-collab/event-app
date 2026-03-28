// lib/features/green/widgets/badges_tab.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/features/green/models/badge_model.dart';
import 'package:event_app/features/green/providers/green_provider.dart';

class BadgesTab extends ConsumerWidget {
  const BadgesTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final badgesAsync = ref.watch(badgesProvider);
    final userBadgesAsync = ref.watch(userBadgesProvider);

    return badgesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Алдаа: $e')),
      data: (badges) => userBadgesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Алдаа: $e')),
        data: (userBadges) {
          final earnedIds = userBadges.map((b) => b.badgeId).toSet();
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: badges.length,
            itemBuilder: (context, i) {
              final badge = badges[i];
              final earned = earnedIds.contains(badge.id);
              return BadgeCard(
                badge: badge,
                earned: earned,
                onTap: () => _showBadgeDialog(context, badge, earned),
              );
            },
          );
        },
      ),
    );
  }

  void _showBadgeDialog(
      BuildContext context, BadgeModel badge, bool earned) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            Text(badge.icon, style: const TextStyle(fontSize: 28)),
            const SizedBox(width: 12),
            Expanded(child: Text(badge.name)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (earned)
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.green.shade100,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text('✓ Олгогдсон',
                    style: TextStyle(color: Colors.green)),
              ),
            const SizedBox(height: 12),
            Text(badge.description),
            const SizedBox(height: 8),
            Text(
              'Шаардлага: ${_formatSteps(badge.requirementSteps)} алхам',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Хаах'),
          ),
        ],
      ),
    );
  }

  String _formatSteps(int steps) {
    if (steps >= 1000) return '${(steps / 1000).toStringAsFixed(0)}k';
    return '$steps';
  }
}

class BadgeCard extends StatelessWidget {
  const BadgeCard({
    super.key,
    required this.badge,
    required this.earned,
    required this.onTap,
  });

  final BadgeModel badge;
  final bool earned;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        child: Stack(
          alignment: Alignment.center,
          children: [
            Opacity(
              opacity: earned ? 1.0 : 0.35,
              child: Center(
                child: Text(badge.icon,
                    style: const TextStyle(fontSize: 36)),
              ),
            ),
            if (earned)
              Positioned(
                top: 4,
                right: 4,
                child: Container(
                  width: 20,
                  height: 20,
                  decoration: const BoxDecoration(
                    color: Colors.green,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check,
                      size: 14, color: Colors.white),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
