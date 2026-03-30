import 'dart:async';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:event_app/core/notifications/local_notification_service.dart';

// ---------------------------------------------------------------------------
// Background Message Handler
// Must be a top-level function or static
// ---------------------------------------------------------------------------

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // If you're going to use other Firebase services in the background, 
  // you must initialize Firebase here as well.
  debugPrint('📩 Handling a background message: ${message.messageId}');
}

// ---------------------------------------------------------------------------
// Firebase Messaging Service
// ---------------------------------------------------------------------------

class FirebaseMessagingService {
  FirebaseMessagingService._();

  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  /// Initialize FCM listeners and permissions
  static Future<void> initialize() async {
    // 1. Request permissions for iOS/Android
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('✅ User granted messaging permissions');
    } else {
      debugPrint('⚠️ User declined or has not accepted messaging permissions');
    }

    // 2. Set the background message handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // 3. Listen for foreground messages
    // (Firebase doesn't show system HUD for foreground messages by default on Android)
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('💬 Foreground message received: ${message.notification?.title}');
      
      final notification = message.notification;
      if (notification != null) {
        // Hand off to LocalNotificationService to show the alert
        LocalNotificationService.showNotification(
          title: notification.title ?? 'Мэдэгдэл', // Notification
          body: notification.body ?? '',
          payload: message.data['route'], // Use data to route if needed
        );
      }
    });

    // 4. Handle notification tap when app is in background but NOT terminated
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('🖱️ Notification opened app: ${message.data}');
      // TODO: Handle navigation based on data
    });

    // 5. Check if app was opened via a notification from a TERMINATED state
    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      debugPrint('🔥 App launched from notification: ${initialMessage.data}');
      // TODO: Handle deep linked navigation
    }
  }

  /// Get the unique FCM token for this device
  static Future<String?> getToken() async {
    try {
      final token = await _messaging.getToken();
      debugPrint('🔑 FCM Token: $token');
      return token;
    } catch (e) {
      debugPrint('❌ Error getting FCM token: $e');
      return null;
    }
  }

  /// Delete the token (usually on sign out)
  static Future<void> deleteToken() async {
    await _messaging.deleteToken();
  }
}
