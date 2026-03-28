// lib/features/notifications/providers/notifications_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/features/notifications/models/notification_item.dart';
import 'package:event_app/features/notifications/repositories/notifications_repository.dart';

final notificationsRepositoryProvider = Provider<NotificationsRepository>(
  (_) => NotificationsRepository(),
);

final notificationsProvider = FutureProvider<List<NotificationItem>>((ref) {
  return ref.watch(notificationsRepositoryProvider).fetchNotifications();
});

final emergencyNotificationsProvider =
    FutureProvider<List<NotificationItem>>((ref) {
  return ref
      .watch(notificationsRepositoryProvider)
      .fetchEmergencyNotifications();
});
