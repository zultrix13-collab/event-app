import 'dart:convert';
import 'package:crypto/crypto.dart';

class DigitalIdPayload {
  final String userId;
  final String role;
  final String eventId;
  final int issuedAt;
  final int expiresAt;

  const DigitalIdPayload({
    required this.userId,
    required this.role,
    required this.eventId,
    required this.issuedAt,
    required this.expiresAt,
  });

  Map<String, dynamic> toMap() => {
    'userId': userId,
    'role': role,
    'eventId': eventId,
    'issuedAt': issuedAt,
    'expiresAt': expiresAt,
  };

  factory DigitalIdPayload.fromMap(Map<String, dynamic> map) =>
    DigitalIdPayload(
      userId: map['userId'] as String,
      role: map['role'] as String,
      eventId: map['eventId'] as String,
      issuedAt: map['issuedAt'] as int,
      expiresAt: map['expiresAt'] as int,
    );

  bool get isExpired => DateTime.now().millisecondsSinceEpoch > expiresAt;
}

class DigitalIdResult {
  final String encodedPayload;
  final String signature;
  final DateTime expiresAt;

  const DigitalIdResult({
    required this.encodedPayload,
    required this.signature,
    required this.expiresAt,
  });

  String get qrData => '$encodedPayload.$signature';
}

class DigitalIdService {
  static const String _secretKey = String.fromEnvironment(
    'DIGITAL_ID_SECRET',
    defaultValue: 'change-me-in-production',
  );
  static const String _eventId = String.fromEnvironment(
    'NEXT_PUBLIC_EVENT_ID',
    defaultValue: 'event-2026',
  );
  static const int _ttlMs = 15 * 60 * 1000;

  static DigitalIdResult generate(String userId, String role) {
    final now = DateTime.now().millisecondsSinceEpoch;
    final expiresAt = now + _ttlMs;

    final payload = DigitalIdPayload(
      userId: userId,
      role: role,
      eventId: _eventId,
      issuedAt: now,
      expiresAt: expiresAt,
    );

    final payloadJson = jsonEncode(payload.toMap());
    final encoded = base64Url.encode(utf8.encode(payloadJson));
    final signature = _hmacSha256(encoded, _secretKey);

    return DigitalIdResult(
      encodedPayload: encoded,
      signature: signature,
      expiresAt: DateTime.fromMillisecondsSinceEpoch(expiresAt),
    );
  }

  static ({bool valid, DigitalIdPayload? payload, String? error}) verify(
    String encodedPayload,
    String signature,
  ) {
    final expectedSig = _hmacSha256(encodedPayload, _secretKey);
    if (expectedSig != signature) {
      return (valid: false, payload: null, error: 'Гарын үсэг буруу');
    }

    try {
      final decoded = utf8.decode(base64Url.decode(encodedPayload));
      final map = jsonDecode(decoded) as Map<String, dynamic>;
      final payload = DigitalIdPayload.fromMap(map);

      if (payload.isExpired) {
        return (valid: false, payload: payload, error: 'Үнэмлэх хугацаа дууссан');
      }

      return (valid: true, payload: payload, error: null);
    } catch (e) {
      return (valid: false, payload: null, error: 'Payload буруу');
    }
  }

  static ({String payload, String signature})? parseQrData(String qrData) {
    final dotIndex = qrData.lastIndexOf('.');
    if (dotIndex < 0) return null;
    return (
      payload: qrData.substring(0, dotIndex),
      signature: qrData.substring(dotIndex + 1),
    );
  }

  static String _hmacSha256(String data, String key) {
    final keyBytes = utf8.encode(key);
    final dataBytes = utf8.encode(data);
    final hmac = Hmac(sha256, keyBytes);
    return hmac.convert(dataBytes).toString();
  }
}
