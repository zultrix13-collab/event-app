import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:saas_base/features/subscription/providers/subscription_provider.dart';
import 'package:saas_base/shared/models/subscription.dart';
import 'package:saas_base/shared/widgets/error_widget.dart';
import 'package:saas_base/shared/widgets/loading_widget.dart';

class SubscriptionScreen extends ConsumerWidget {
  const SubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final subState = ref.watch(subscriptionProvider);

    if (subState.isLoading) return const Scaffold(body: LoadingWidget());
    if (subState.error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Subscription')),
        body: AppErrorWidget(
          message: subState.error!,
          onRetry: () => ref.read(subscriptionProvider.notifier).fetchSubscription(),
        ),
      );
    }

    final sub = subState.subscription;

    return Scaffold(
      appBar: AppBar(title: const Text('Subscription')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (sub == null)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    const Icon(Icons.credit_card_off, size: 48),
                    const SizedBox(height: 8),
                    Text(
                      'Идэвхтэй subscription байхгүй',
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {/* TODO: upgrade flow */},
                      child: const Text('Subscription авах'),
                    ),
                  ],
                ),
              ),
            )
          else ...[
            _PlanCard(sub: sub),
            const SizedBox(height: 16),
            _LimitsCard(plan: sub.plan),
          ],
        ],
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({required this.sub});
  final Subscription sub;

  Color _statusColor(BuildContext context) {
    return switch (sub.status) {
      SubscriptionStatus.active => Colors.green,
      SubscriptionStatus.trialing => Colors.blue,
      SubscriptionStatus.pastDue => Colors.orange,
      SubscriptionStatus.canceled => Colors.red,
      _ => Theme.of(context).colorScheme.outline,
    };
  }

  String _statusLabel() {
    return switch (sub.status) {
      SubscriptionStatus.active => 'Идэвхтэй',
      SubscriptionStatus.trialing => 'Туршилт',
      SubscriptionStatus.pastDue => 'Хоцорсон',
      SubscriptionStatus.canceled => 'Цуцлагдсан',
      _ => 'Тодорхойгүй',
    };
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  sub.plan.name,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const Spacer(),
                Chip(
                  label: Text(_statusLabel()),
                  backgroundColor: _statusColor(context).withOpacity(0.15),
                  labelStyle: TextStyle(color: _statusColor(context)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              '\$${sub.plan.priceMonthly.toStringAsFixed(2)} / сар',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            if (sub.currentPeriodEnd != null) ...[
              const SizedBox(height: 4),
              Text(
                'Дуусах: ${sub.currentPeriodEnd!.toLocal().toString().split(' ')[0]}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _LimitsCard extends StatelessWidget {
  const _LimitsCard({required this.plan});
  final Plan plan;

  @override
  Widget build(BuildContext context) {
    if (plan.limits.isEmpty) return const SizedBox.shrink();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Plan limitүүд',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            ...plan.limits.entries.map(
              (e) => ListTile(
                dense: true,
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.check_circle_outline),
                title: Text(e.key),
                trailing: Text(e.value.toString()),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
