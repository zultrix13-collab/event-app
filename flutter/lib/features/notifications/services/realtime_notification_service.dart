import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:event_app/features/notifications/models/notification_item.dart';

// ---------------------------------------------------------------------------
// RealtimeNotificationService
//
// Supabase Realtime-аар 'notifications' хүснэгтэд шинэ мэдэгдэл орох үед
// listener-уудыг дуудна. AppShell дотор дан channel subscribe хийгдэнэ.
// ---------------------------------------------------------------------------

typedef NotificationCallback = void Function(NotificationItem item);

class RealtimeNotificationService {
  RealtimeNotificationService._();

  static final RealtimeNotificationService instance =
      RealtimeNotificationService._();

  final _client = Supabase.instance.client;

  RealtimeChannel? _channel;
  final List<NotificationCallback> _listeners = [];

  // -------------------------------------------------------------------------
  // Subscribe
  // -------------------------------------------------------------------------

  /// Realtime channel-д subscribe хийнэ. Хэрэв аль хэдийн subscribe болсон бол
  /// дахин холбогдохгүй.
  void subscribe() {
    if (_channel != null) return;

    _channel = _client
        .channel('public:notifications')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'notifications',
          callback: _onInsert,
        )
        .subscribe((status, [error]) {
      if (status == RealtimeSubscribeStatus.subscribed) {
        debugPrint('[RealtimeNotifications] subscribed ✓');
      } else if (error != null) {
        debugPrint('[RealtimeNotifications] error: $error');
      }
    });
  }

  // -------------------------------------------------------------------------
  // Unsubscribe
  // -------------------------------------------------------------------------

  Future<void> unsubscribe() async {
    if (_channel == null) return;
    await _client.removeChannel(_channel!);
    _channel = null;
    debugPrint('[RealtimeNotifications] unsubscribed');
  }

  // -------------------------------------------------------------------------
  // Listener management
  // -------------------------------------------------------------------------

  void addListener(NotificationCallback listener) {
    _listeners.add(listener);
  }

  void removeListener(NotificationCallback listener) {
    _listeners.remove(listener);
  }

  // -------------------------------------------------------------------------
  // Internal
  // -------------------------------------------------------------------------

  void _onInsert(PostgresChangePayload payload) {
    try {
      final record = payload.newRecord;
      if (record.isEmpty) return;

      final item = NotificationItem.fromJson(record);
      debugPrint('[RealtimeNotifications] new notification: ${item.title}');

      for (final listener in List.of(_listeners)) {
        listener(item);
      }
    } catch (e) {
      debugPrint('[RealtimeNotifications] parse error: $e');
    }
  }
}
