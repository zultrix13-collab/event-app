import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:saas_base/features/organization/providers/org_provider.dart';
import 'package:saas_base/shared/widgets/error_widget.dart';
import 'package:saas_base/shared/widgets/loading_widget.dart';

class OrgScreen extends ConsumerWidget {
  const OrgScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orgState = ref.watch(orgProvider);

    if (orgState.isLoading) return const LoadingWidget();
    if (orgState.error != null) {
      return AppErrorWidget(
        message: orgState.error!,
        onRetry: () => ref.read(orgProvider.notifier).fetchOrg(),
      );
    }

    final org = orgState.organization;
    if (org == null) return const AppErrorWidget(message: 'Байгууллага олдсонгүй');

    return Scaffold(
      appBar: AppBar(title: const Text('Байгууллагын мэдээлэл')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              leading: const Icon(Icons.business),
              title: Text(org.name),
              subtitle: Text(org.slug),
            ),
          ),
          const SizedBox(height: 8),
          Card(
            child: ListTile(
              leading: const Icon(Icons.calendar_today),
              title: const Text('Бүртгэгдсэн'),
              subtitle: Text(org.createdAt.toLocal().toString().split(' ')[0]),
            ),
          ),
        ],
      ),
    );
  }
}
