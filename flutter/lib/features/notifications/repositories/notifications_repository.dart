// lib/features/notifications/repositories/notifications_repository.dart

import 'package:event_app/core/supabase/supabase_client.dart';
import 'package:event_app/features/notifications/models/notification_item.dart';

class NotificationsRepository {
  final _client = SupabaseConfig.client;

  Future<List<NotificationItem>> fetchNotifications() async {
    final data = await _client
        .from('notifications')
        .select()
        .order('sent_at', ascending: false);

    return (data as List).map((e) => NotificationItem.fromJson(e)).toList();
  }

  Future<List<NotificationItem>> fetchEmergencyNotifications() async {
    final since = DateTime.now()
        .subtract(const Duration(hours: 24))
        .toIso8601String();

    final data = await _client
        .from('notifications')
        .select()
        .eq('is_emergency', true)
        .gte('sent_at', since)
        .order('sent_at', ascending: false);

    return (data as List).map((e) => NotificationItem.fromJson(e)).toList();
  }
}
