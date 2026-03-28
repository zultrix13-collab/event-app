// lib/features/green/widgets/leaderboard_tab.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/features/auth/providers/auth_provider.dart';
import 'package:event_app/features/green/providers/green_provider.dart';

class LeaderboardTab extends ConsumerWidget {
  const LeaderboardTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final leaderboardAsync = ref.watch(leaderboardProvider);
    final currentUser = ref.watch(currentUserProvider);

    return leaderboardAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Алдаа: $e')),
      data: (entries) {
        if (entries.isEmpty) {
          return const Center(child: Text('Өгөгдөл байхгүй'));
        }
        return ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 8),
          itemCount: entries.length,
          itemBuilder: (context, i) {
            final entry = entries[i];
            final userId = entry['user_id'] as String?;
            final isMe = userId == currentUser?.id;
            return LeaderboardTile(
              rank: i + 1,
              entry: entry,
              isMe: isMe,
            );
          },
        );
      },
    );
  }
}

class LeaderboardTile extends StatelessWidget {
  const LeaderboardTile({
    super.key,
    required this.rank,
    required this.entry,
    required this.isMe,
  });

  final int rank;
  final Map<String, dynamic> entry;
  final bool isMe;

  String _medal(int r) {
    switch (r) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '$r';
    }
  }

  String _formatSteps(int steps) {
    if (steps >= 1000) return '${(steps / 1000).toStringAsFixed(1)}k';
    return '$steps';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final name = entry['full_name'] as String? ??
        entry['email'] as String? ??
        'Хэрэглэгч';
    final totalSteps = entry['total_steps'] as int? ?? 0;
    final initials = name.isNotEmpty ? name[0].toUpperCase() : '?';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: isMe
            ? theme.colorScheme.primaryContainer
            : theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: isMe
            ? Border.all(color: theme.colorScheme.primary, width: 1.5)
            : null,
      ),
      child: ListTile(
        leading: SizedBox(
          width: 36,
          child: rank <= 3
              ? Center(
                  child: Text(_medal(rank),
                      style: const TextStyle(fontSize: 22)))
              : Center(
                  child: Text(
                    '$rank',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
        ),
        title: Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: isMe
                  ? theme.colorScheme.primary
                  : theme.colorScheme.secondaryContainer,
              child: Text(
                initials,
                style: TextStyle(
                  fontSize: 13,
                  color: isMe
                      ? theme.colorScheme.onPrimary
                      : theme.colorScheme.onSecondaryContainer,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                isMe ? '$name (Та)' : name,
                style: TextStyle(
                  fontWeight: isMe ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
          ],
        ),
        trailing: Text(
          _formatSteps(totalSteps),
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: isMe ? theme.colorScheme.primary : null,
          ),
        ),
      ),
    );
  }
}
