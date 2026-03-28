// lib/features/notifications/screens/notifications_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/features/notifications/models/notification_item.dart';
import 'package:event_app/features/notifications/providers/notifications_provider.dart';

// Local read state provider
final _readNotificationIdsProvider =
    StateProvider<Set<String>>((_) => const {});

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationsProvider);
    final emergencyAsync = ref.watch(emergencyNotificationsProvider);
    final readIds = ref.watch(_readNotificationIdsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Мэдэгдлүүд'),
        leading: BackButton(onPressed: () => context.go('/home')),
        actions: [
          TextButton(
            onPressed: () {
              final notifs = notificationsAsync.valueOrNull ?? [];
              ref.read(_readNotificationIdsProvider.notifier).state =
                  notifs.map((n) => n.id).toSet();
            },
            child: const Text('Бүгдийг уншсан'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Emergency banner
          emergencyAsync.when(
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
            data: (emergencies) {
              if (emergencies.isEmpty) return const SizedBox.shrink();
              return _EmergencyBanner(notifications: emergencies);
            },
          ),

          // Notification list
          Expanded(
            child: notificationsAsync.when(
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Алдаа: $e')),
              data: (notifications) {
                if (notifications.isEmpty) {
                  return const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.notifications_none,
                            size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text(
                          'Мэдэгдэл байхгүй байна',
                          style: TextStyle(
                              color: Colors.grey, fontSize: 16),
                        ),
                      ],
                    ),
                  );
                }
                return ListView.builder(
                  itemCount: notifications.length,
                  itemBuilder: (context, i) {
                    final notif = notifications[i];
                    final isRead = readIds.contains(notif.id);
                    return _NotificationTile(
                      notification: notif,
                      isRead: isRead,
                      onTap: () {
                        ref
                            .read(_readNotificationIdsProvider.notifier)
                            .update((ids) => {...ids, notif.id});
                      },
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Emergency Banner
// ---------------------------------------------------------------------------

class _EmergencyBanner extends StatelessWidget {
  const _EmergencyBanner({required this.notifications});
  final List<NotificationItem> notifications;

  @override
  Widget build(BuildContext context) {
    final latest = notifications.first;
    return Container(
      width: double.infinity,
      color: Colors.red.shade700,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_rounded,
              color: Colors.white, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  latest.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  latest.body,
                  style: const TextStyle(
                      color: Colors.white70, fontSize: 13),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Notification Tile
// ---------------------------------------------------------------------------

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({
    required this.notification,
    required this.isRead,
    required this.onTap,
  });

  final NotificationItem notification;
  final bool isRead;
  final VoidCallback onTap;

  IconData _iconForType(NotificationType type) {
    switch (type) {
      case NotificationType.programme:
        return Icons.calendar_month;
      case NotificationType.emergency:
        return Icons.warning_amber_rounded;
      case NotificationType.system:
        return Icons.settings;
      case NotificationType.general:
        return Icons.notifications;
    }
  }

  Color _colorForType(NotificationType type) {
    switch (type) {
      case NotificationType.programme:
        return Colors.blue;
      case NotificationType.emergency:
        return Colors.red;
      case NotificationType.system:
        return Colors.grey;
      case NotificationType.general:
        return Colors.teal;
    }
  }

  String _timeAgo(DateTime sentAt) {
    final diff = DateTime.now().difference(sentAt);
    if (diff.inMinutes < 1) return 'Дөнгөж сая';
    if (diff.inMinutes < 60) return '${diff.inMinutes} минутын өмнө';
    if (diff.inHours < 24) return '${diff.inHours} цагийн өмнө';
    return '${diff.inDays} өдрийн өмнө';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final typeColor = _colorForType(notification.type);

    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        color: isRead ? null : theme.colorScheme.primaryContainer.withOpacity(0.3),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: typeColor.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(_iconForType(notification.type),
                  color: typeColor, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notification.title,
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: isRead
                                ? FontWeight.normal
                                : FontWeight.bold,
                          ),
                        ),
                      ),
                      Text(
                        _timeAgo(notification.sentAt),
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notification.body,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            if (!isRead)
              Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.only(left: 8, top: 6),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
