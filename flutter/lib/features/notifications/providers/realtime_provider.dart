import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/features/notifications/models/notification_item.dart';
import 'package:event_app/features/notifications/services/realtime_notification_service.dart';

// ---------------------------------------------------------------------------
// Realtime Notifications State Notifier
//
// AppShell эсвэл main.dart-аас initialize хийнэ.
// Шинэ мэдэгдэл орох бол list-ийн эхэнд нэмнэ (хамгийн сүүлийнх дээр).
// ---------------------------------------------------------------------------

class RealtimeNotificationsNotifier
    extends StateNotifier<List<NotificationItem>> {
  RealtimeNotificationsNotifier() : super([]) {
    _service = RealtimeNotificationService.instance;
    _service.addListener(_onNewNotification);
    _service.subscribe();
  }

  late final RealtimeNotificationService _service;

  void _onNewNotification(NotificationItem item) {
    // Шинэ мэдэгдлийг жагсаалтын эхэнд оруулна (хамгийн сүүлийнх дээр)
    state = [item, ...state];
  }

  /// Бүх мэдэгдлийг устгах (цэвэрлэх)
  void clear() => state = [];

  @override
  void dispose() {
    _service.removeListener(_onNewNotification);
    // Channel-ийг унсубскрайб хийхгүй — бусад хэрэглэгч байж болно.
    // AppShell dispose дотор `RealtimeNotificationService.instance.unsubscribe()` дуудна.
    super.dispose();
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/// Realtime-аар ирсэн мэдэгдлүүдийн жагсаалт.
/// AppShell доторх ConsumerStatefulWidget subscribe/unsubscribe хийнэ.
final realtimeNotificationsProvider =
    StateNotifierProvider<RealtimeNotificationsNotifier, List<NotificationItem>>(
  (ref) => RealtimeNotificationsNotifier(),
);
