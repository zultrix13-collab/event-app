import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:event_app/core/notifications/firebase_messaging_service.dart';
import 'package:event_app/core/supabase/supabase_client.dart';

// ---------------------------------------------------------------------------
// Auth State
// ---------------------------------------------------------------------------

enum AuthStatus { loading, authenticated, unauthenticated }

class AuthState {
  const AuthState({
    this.status = AuthStatus.loading,
    this.session,
    this.error,
    this.isApproved,
    this.role,
    this.cooldownSeconds = 0,
    this.otpError,
  });

  final AuthStatus status;
  final Session? session;
  final String? error;

  /// Хэрэглэгч баталгаажсан эсэх (admin-ийн зөвшөөрөл)
  /// null = шалгаагүй байна
  final bool? isApproved;

  /// Хэрэглэгчийн үүрэг: 'vip' | 'participant' | 'specialist'
  final String? role;

  /// OTP resend cooldown (seconds remaining)
  final int cooldownSeconds;

  /// OTP-specific error message
  final String? otpError;

  bool get isAuthenticated => status == AuthStatus.authenticated;

  /// pending-approval дэлгэц үзүүлэх эсэх
  bool get needsApproval => isAuthenticated && isApproved == false;

  bool get isOnCooldown => cooldownSeconds > 0;

  AuthState copyWith({
    AuthStatus? status,
    Session? session,
    String? error,
    bool? isApproved,
    String? role,
    int? cooldownSeconds,
    String? otpError,
  }) {
    return AuthState(
      status: status ?? this.status,
      session: session ?? this.session,
      error: error,
      isApproved: isApproved ?? this.isApproved,
      role: role ?? this.role,
      cooldownSeconds: cooldownSeconds ?? this.cooldownSeconds,
      otpError: otpError,
    );
  }
}

// ---------------------------------------------------------------------------
// Auth Notifier
// ---------------------------------------------------------------------------

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    _init();
  }

  final _client = SupabaseConfig.client;
  Timer? _cooldownTimer;

  @override
  void dispose() {
    _cooldownTimer?.cancel();
    super.dispose();
  }

  void _init() {
    final session = _client.auth.currentSession;
    if (session != null) {
      state = AuthState(status: AuthStatus.authenticated, session: session);
      _fetchUserProfile(session.user.id);
    } else {
      state = const AuthState(status: AuthStatus.unauthenticated);
    }

    _client.auth.onAuthStateChange.listen((data) {
      final session = data.session;
      if (session != null) {
        state = state.copyWith(
          status: AuthStatus.authenticated,
          session: session,
        );
        _fetchUserProfile(session.user.id);
      } else {
        state = const AuthState(status: AuthStatus.unauthenticated);
      }
    });
  }

  /// Хэрэглэгчийн профайлыг DB-ээс авах (is_approved, role)
  Future<void> _fetchUserProfile(String userId) async {
    try {
      final data = await _client
          .from('profiles')
          .select('is_approved, role')
          .eq('id', userId)
          .maybeSingle();

      if (data != null) {
        state = state.copyWith(
          isApproved: data['is_approved'] as bool? ?? false,
          role: data['role'] as String? ?? 'participant',
        );
      } else {
        state = state.copyWith(isApproved: false, role: 'participant');
      }
    } catch (e) {
      debugPrint('[AuthNotifier] profile fetch failed (table missing / RLS): $e');
      state = state.copyWith(isApproved: false, role: 'participant');
    }

    // --- NEW: Sync FCM Token ---
    try {
      final token = await FirebaseMessagingService.getToken();
      if (token != null) {
        await _client
            .from('profiles')
            .update({'fcm_token': token})
            .eq('id', userId);
        debugPrint('✅ FCM Token synced for user: $userId');
      }
    } catch (e) {
      debugPrint('⚠️ FCM Token sync failed: $e');
      // This might fail if the column 'fcm_token' doesn't exist yet
    }
  }

  /// Start 60s resend cooldown timer
  void _startCooldown([int seconds = 60]) {
    _cooldownTimer?.cancel();
    state = state.copyWith(cooldownSeconds: seconds);
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      final remaining = state.cooldownSeconds - 1;
      if (remaining <= 0) {
        timer.cancel();
        state = state.copyWith(cooldownSeconds: 0);
      } else {
        state = state.copyWith(cooldownSeconds: remaining);
      }
    });
  }

  /// Check OTP rate limit via Supabase RPC.
  /// Returns null if allowed, or an error message string if blocked.
  Future<String?> _checkRateLimit(String email) async {
    try {
      final result = await _client.rpc(
        'check_otp_rate_limit',
        params: {'p_email': email},
      );
      if (result == null) return null;
      final data = result as Map<String, dynamic>;
      final allowed = data['allowed'] as bool? ?? true;
      if (!allowed) {
        final blockedUntil = data['blocked_until'] as String?;
        int minutesLeft = 10;
        if (blockedUntil != null) {
          final blockedDate = DateTime.tryParse(blockedUntil);
          if (blockedDate != null) {
            minutesLeft =
                ((blockedDate.difference(DateTime.now()).inSeconds + 59) ~/ 60)
                    .clamp(1, 60);
          }
        }
        return 'Хэт олон оролдлого. $minutesLeft минутын дараа дахин оролдоно уу.';
      }
      return null;
    } catch (e) {
      // Fail open — RPC unavailable, allow the request
      debugPrint('[AuthNotifier] rate limit RPC error: $e');
      return null;
    }
  }

  /// Email OTP илгээх
  Future<void> sendOtp(String email) async {
    // Local cooldown check
    if (state.isOnCooldown) {
      state = state.copyWith(
        otpError: 'Хүлээнэ үү: ${state.cooldownSeconds} секунд',
      );
      return;
    }

    state = state.copyWith(
      status: AuthStatus.loading,
      otpError: null,
      error: null, // Clear general errors too
    );

    // Server-side rate limit via RPC
    final rateLimitError = await _checkRateLimit(email);
    if (rateLimitError != null) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        otpError: rateLimitError,
      );
      return;
    }

    try {
      await _client.auth.signInWithOtp(email: email);
      _startCooldown(60);
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        otpError: null,
      );
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: e.toString(),
        otpError: e.toString(),
      );
    }
  }

  /// OTP verify хийх
  Future<void> verifyOtp({required String email, required String token}) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      final response = await _client.auth.verifyOTP(
        email: email,
        token: token,
        type: OtpType.email,
      );
      if (response.session != null) {
        _cooldownTimer?.cancel();
        state = AuthState(
          status: AuthStatus.authenticated,
          session: response.session,
        );
        await _fetchUserProfile(response.session!.user.id);
      } else {
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          error: 'Verify амжилтгүй',
        );
      }
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: e.toString(),
      );
    }
  }

  /// Google Sign-In — Supabase native OAuth (Firebase/google_sign_in шаардахгүй)
  Future<void> signInWithGoogle() async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      await _client.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: 'mn.devgrafx.eventapp://login-callback',
      );
      // Auth state change нь onAuthStateChange listener-ээр автоматаар handle хийгдэнэ
    } catch (e) {
      debugPrint('[AuthNotifier] Google Sign-In error: $e');
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: 'Google-ээр нэвтрэх амжилтгүй: $e',
      );
    }
  }

  /// Sign out
  Future<void> signOut() async {
    _cooldownTimer?.cancel();
    await _client.auth.signOut();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (_) => AuthNotifier(),
);

/// Convenience: current Supabase user
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authProvider).session?.user;
});

/// Convenience: current role
final currentRoleProvider = Provider<String>((ref) {
  return ref.watch(authProvider).role ?? 'participant';
});
