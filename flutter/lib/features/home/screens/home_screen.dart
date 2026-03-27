import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:saas_base/features/auth/providers/auth_provider.dart';
import 'package:saas_base/features/home/widgets/placeholder_content.dart';
import 'package:saas_base/features/organization/providers/org_provider.dart';
import 'package:saas_base/features/subscription/providers/subscription_provider.dart';
import 'package:saas_base/shared/models/subscription.dart';
import 'package:saas_base/shared/widgets/loading_widget.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orgState = ref.watch(orgProvider);
    final subState = ref.watch(subscriptionProvider);

    if (orgState.isLoading) return const Scaffold(body: LoadingWidget());

    final org = orgState.organization;
    final sub = subState.subscription;

    return Scaffold(
      appBar: AppBar(
        title: Text(org?.name ?? 'Home'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.go('/org'),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authProvider.notifier).signOut();
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(orgProvider.notifier).fetchOrg();
          await ref.read(subscriptionProvider.notifier).fetchSubscription();
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Org name + plan badge
            if (org != null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      const Icon(Icons.business, size: 32),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              org.name,
                              style: Theme.of(context)
                                  .textTheme
                                  .titleMedium
                                  ?.copyWith(fontWeight: FontWeight.bold),
                            ),
                            Text(
                              org.slug,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ],
                        ),
                      ),
                      if (sub != null)
                        Chip(
                          label: Text(sub.plan.name),
                          backgroundColor:
                              Theme.of(context).colorScheme.primaryContainer,
                        ),
                    ],
                  ),
                ),
              ),

            const SizedBox(height: 12),

            // Subscription status card
            _SubscriptionStatusCard(sub: sub),

            const SizedBox(height: 16),

            // Domain-specific content placeholder
            const PlaceholderContent(),

            const SizedBox(height: 16),

            // Settings / Subscription link
            OutlinedButton.icon(
              onPressed: () => context.go('/subscription'),
              icon: const Icon(Icons.credit_card),
              label: const Text('Subscription харах'),
            ),
          ],
        ),
      ),
    );
  }
}

class _SubscriptionStatusCard extends StatelessWidget {
  const _SubscriptionStatusCard({this.sub});
  final sub;

  @override
  Widget build(BuildContext context) {
    if (sub == null) {
      return Card(
        color: Theme.of(context).colorScheme.errorContainer,
        child: ListTile(
          leading: const Icon(Icons.warning_amber),
          title: const Text('Subscription байхгүй'),
          subtitle: const Text('Системийн бүрэн функцийг ашиглахын тулд subscription авна уу'),
          trailing: TextButton(
            onPressed: () => GoRouter.of(context).go('/subscription'),
            child: const Text('Авах'),
          ),
        ),
      );
    }

    final isActive = (sub.status == SubscriptionStatus.active ||
        sub.status == SubscriptionStatus.trialing);

    return Card(
      color: isActive
          ? Theme.of(context).colorScheme.primaryContainer
          : Theme.of(context).colorScheme.errorContainer,
      child: ListTile(
        leading: Icon(isActive ? Icons.check_circle : Icons.error),
        title: Text(sub.plan.name),
        subtitle: Text(
          isActive ? 'Идэвхтэй subscription' : 'Subscription идэвхгүй',
        ),
      ),
    );
  }
}
