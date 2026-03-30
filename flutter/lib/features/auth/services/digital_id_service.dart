import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:event_app/core/config/app_config.dart';

/// QR payload format:
/// {
///   "uid": "uuid",
///   "exp": 1234567890,   // Unix timestamp (seconds)
///   "role": "vip",
///   "sig": "hmac-sha256-hex"
/// }

class DigitalIdVerifyResult {
  final bool valid;
  final String? uid;
  final String? role;
  final DateTime? expiresAt;
  final String? error;

  const DigitalIdVerifyResult({
    required this.valid,
    this.uid,
    this.role,
    this.expiresAt,
    this.error,
  });
}

class DigitalIdService {
  DigitalIdService._();

  static final DigitalIdService instance = DigitalIdService._();

  // HMAC secret is injected at build time via --dart-define
  static const _hmacSecret = String.fromEnvironment(
    'DIGITAL_ID_HMAC_SECRET',
    defaultValue: 'change-me-in-production',
  );

  /// Verify a QR payload string (the JSON string stored in digital_ids.qr_payload).
  ///
  /// The QR code should encode the raw JSON string. This method:
  /// 1. Parses the JSON
  /// 2. Checks expiry
  /// 3. Verifies HMAC-SHA256 signature
  DigitalIdVerifyResult verifyDigitalId(String qrPayload) {
    try {
      // 1. Parse JSON
      final Map<String, dynamic> data = jsonDecode(qrPayload) as Map<String, dynamic>;

      final uid = data['uid'] as String?;
      final exp = data['exp'] as int?;
      final role = data['role'] as String?;
      final sig = data['sig'] as String?;

      if (uid == null || exp == null || role == null || sig == null) {
        return const DigitalIdVerifyResult(
          valid: false,
          error: 'Invalid payload: missing fields',
        );
      }

      // 2. Check expiry
      final expiresAt = DateTime.fromMillisecondsSinceEpoch(exp * 1000, isUtc: true);
      if (DateTime.now().isAfter(expiresAt)) {
        return DigitalIdVerifyResult(
          valid: false,
          expiresAt: expiresAt,
          error: 'Digital ID expired',
        );
      }

      // 3. Verify HMAC-SHA256
      // The signature is computed over the canonical JSON without the "sig" field.
      final canonicalData = <String, dynamic>{
        'uid': uid,
        'exp': exp,
        'role': role,
      };
      final canonicalJson = jsonEncode(canonicalData);
      final expectedSig = _computeHmac(canonicalJson);

      if (expectedSig != sig) {
        return const DigitalIdVerifyResult(
          valid: false,
          error: 'Invalid signature',
        );
      }

      return DigitalIdVerifyResult(
        valid: true,
        uid: uid,
        role: role,
        expiresAt: expiresAt,
      );
    } catch (e) {
      return DigitalIdVerifyResult(
        valid: false,
        error: 'Parse error: $e',
      );
    }
  }

  String _computeHmac(String data) {
    final key = utf8.encode(_hmacSecret);
    final bytes = utf8.encode(data);
    final hmac = Hmac(sha256, key);
    final digest = hmac.convert(bytes);
    return digest.toString();
  }

  /// Build a QR payload string with HMAC signature (for admin use / testing).
  String buildSignedPayload({
    required String uid,
    required String role,
    required DateTime expiresAt,
  }) {
    final exp = expiresAt.millisecondsSinceEpoch ~/ 1000;
    final canonicalData = <String, dynamic>{
      'uid': uid,
      'exp': exp,
      'role': role,
    };
    final canonicalJson = jsonEncode(canonicalData);
    final sig = _computeHmac(canonicalJson);

    final fullPayload = <String, dynamic>{
      'uid': uid,
      'exp': exp,
      'role': role,
      'sig': sig,
    };
    return jsonEncode(fullPayload);
  }

  /// Checks if a HMAC secret is configured (non-default).
  bool get isConfigured =>
      _hmacSecret != 'change-me-in-production' || AppConfig.isConfigured;
}
