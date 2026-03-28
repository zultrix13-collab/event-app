import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/features/auth/providers/auth_provider.dart';

// ---------------------------------------------------------------------------
// PendingApprovalScreen — Баталгаажуулалт хүлээж буй дэлгэц
// ---------------------------------------------------------------------------

class PendingApprovalScreen extends ConsumerWidget {
  const PendingApprovalScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Illustration
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: theme.colorScheme.secondaryContainer,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.hourglass_top_rounded,
                  size: 60,
                  color: theme.colorScheme.secondary,
                ),
              ),
              const SizedBox(height: 32),

              Text(
                'Хүлээгдэж байна', // Pending
                style: theme.textTheme.headlineSmall
                    ?.copyWith(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),

              // Main message
              Text(
                'Та бүртгэлийн хүсэлт илгээсэн байна. '
                'Администратор шалгаж баталгаажуулна.',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),

              Text(
                // Your account is awaiting admin approval. Please wait.
                'Баталгаажсаны дараа та нэвтрэх боломжтой болно.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),

              // Sign out button
              FilledButton.tonal(
                onPressed: () => _signOut(context, ref),
                child: const Text('Гарах'), // Sign out
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _signOut(BuildContext context, WidgetRef ref) async {
    await ref.read(authProvider.notifier).signOut();
    if (context.mounted) context.go('/login');
  }
}
