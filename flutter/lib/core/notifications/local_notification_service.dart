import 'package:flutter_local_notifications/flutter_local_notifications.dart';

// Local notifications using flutter_local_notifications.
// Used to show push notifications when the app is in the foreground.
// Also used as the display layer for FCM messages once Firebase is configured.

class LocalNotificationService {
  LocalNotificationService._();

  static final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  /// Call once in main() before runApp.
  static Future<void> initialize() async {
    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    await _plugin.initialize(
      settings,
      onDidReceiveNotificationResponse: _onNotificationTap,
    );
  }

  /// Show a local notification immediately.
  static Future<void> showNotification({
    required String title,
    required String body,
    String? payload,
    int id = 0,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'event_notifications', // channel id
      'Арга хэмжааны мэдэгдэл', // channel name (Mongolian: Event notifications)
      channelDescription: 'Арга хэмжээтэй холбоотой мэдэгдэлүүд',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
    );
    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );
    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _plugin.show(id, title, body, details, payload: payload);
  }

  static void _onNotificationTap(NotificationResponse response) {
    // TODO: Handle notification tap — navigate to relevant screen
    // Use payload to route: e.g., '/programme/session-id'
  }
}
