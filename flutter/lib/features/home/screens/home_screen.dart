import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/features/auth/providers/auth_provider.dart';
import 'package:event_app/features/notifications/providers/notifications_provider.dart';

// ---------------------------------------------------------------------------
// HomeScreen — Арга хэмжээний нүүр хуудас
// ---------------------------------------------------------------------------

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final metadata = user?.userMetadata ?? {};
    final fullName = metadata['full_name'] as String? ??
        metadata['name'] as String? ??
        user?.email?.split('@').first ??
        'Зочин'; // Guest

    final emergencyAsync = ref.watch(emergencyNotificationsProvider);
    final hasEmergency =
        emergencyAsync.valueOrNull?.isNotEmpty ?? false;

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/chat'),
        icon: const Icon(Icons.chat_bubble_outline_rounded),
        label: const Text('AI Туслах'),
        tooltip: 'AI Туслах',
      ),
      appBar: AppBar(
        title: const Text('Арга хэмжээ'), // Event
        centerTitle: false,
        actions: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () => context.go('/notifications'),
                tooltip: 'Мэдэгдлүүд',
              ),
              if (hasEmergency)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Welcome card
          _WelcomeCard(fullName: fullName),
          const SizedBox(height: 20),

          // Quick action cards
          Text(
            'Товч хандах', // Quick access
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          _QuickActionsGrid(),

          const SizedBox(height: 20),

          // Next session card
          Text(
            'Дараагийн хичээл', // Next session
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          const _NextSessionCard(),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Welcome card
// ---------------------------------------------------------------------------

class _WelcomeCard extends StatelessWidget {
  const _WelcomeCard({required this.fullName});
  final String fullName;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      color: theme.colorScheme.primaryContainer,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Сайн байна уу!', // Welcome!
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onPrimaryContainer
                          .withOpacity(0.8),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    fullName,
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onPrimaryContainer,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.waving_hand,
              size: 40,
              color: theme.colorScheme.onPrimaryContainer,
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Quick actions grid
// ---------------------------------------------------------------------------

class _QuickActionsGrid extends StatelessWidget {
  _QuickActionsGrid();

  final _actions = const [
    _QuickAction(
      label: 'Хөтөлбөр',     // Programme
      icon: Icons.calendar_month,
      route: '/programme',
      color: Colors.blue,
    ),
    _QuickAction(
      label: 'Газрын зураг',  // Map
      icon: Icons.map,
      route: '/map',
      color: Colors.green,
    ),
    _QuickAction(
      label: 'Үйлчилгээ',    // Services
      icon: Icons.store,
      route: '/services',
      color: Colors.orange,
    ),
    _QuickAction(
      label: 'Ногоон',        // Green
      icon: Icons.eco,
      route: '/green',
      color: Color(0xFF2E7D32),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.4,
      children: _actions
          .map((action) => _QuickActionCard(action: action))
          .toList(),
    );
  }
}

class _QuickAction {
  const _QuickAction({
    required this.label,
    required this.icon,
    required this.route,
    required this.color,
  });
  final String label;
  final IconData icon;
  final String route;
  final Color color;
}

class _QuickActionCard extends StatelessWidget {
  const _QuickActionCard({required this.action});
  final _QuickAction action;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => context.go(action.route),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(action.icon, size: 32, color: action.color),
              const SizedBox(height: 8),
              Text(
                action.label,
                style: Theme.of(context)
                    .textTheme
                    .labelLarge
                    ?.copyWith(fontWeight: FontWeight.w600),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Next session card (static placeholder)
// ---------------------------------------------------------------------------

class _NextSessionCard extends StatelessWidget {
  const _NextSessionCard();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: theme.colorScheme.secondaryContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    '09:00',
                    style: theme.textTheme.labelLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onSecondaryContainer,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Нээлтийн ёслол', // Opening ceremony
                    style: theme.textTheme.titleMedium
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        Icons.location_on_outlined,
                        size: 16,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Main Hall',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ],
        ),
      ),
    );
  }
}
