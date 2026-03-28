// lib/features/notifications/models/notification_item.dart

enum NotificationType { general, programme, emergency, system }

NotificationType _parseType(String? raw) {
  switch (raw) {
    case 'programme':
      return NotificationType.programme;
    case 'emergency':
      return NotificationType.emergency;
    case 'system':
      return NotificationType.system;
    default:
      return NotificationType.general;
  }
}

class NotificationItem {
  const NotificationItem({
    required this.id,
    required this.title,
    required this.titleEn,
    required this.body,
    required this.bodyEn,
    required this.type,
    required this.isEmergency,
    required this.sentAt,
  });

  final String id;
  final String title;
  final String titleEn;
  final String body;
  final String bodyEn;
  final NotificationType type;
  final bool isEmergency;
  final DateTime sentAt;

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'] as String,
      title: json['title'] as String? ?? '',
      titleEn: json['title_en'] as String? ?? json['title'] as String? ?? '',
      body: json['body'] as String? ?? '',
      bodyEn: json['body_en'] as String? ?? json['body'] as String? ?? '',
      type: _parseType(json['notification_type'] as String?),
      isEmergency: json['is_emergency'] as bool? ?? false,
      sentAt: DateTime.parse(json['sent_at'] as String),
    );
  }
}
