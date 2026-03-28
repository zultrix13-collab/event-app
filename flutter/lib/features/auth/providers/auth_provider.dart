import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
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
  });

  final AuthStatus status;
  final Session? session;
  final String? error;

  /// Хэрэглэгч баталгаажсан эсэх (admin-ийн зөвшөөрөл)
  /// null = шалгаагүй байна
  final bool? isApproved;

  /// Хэрэглэгчийн үүрэг: 'vip' | 'participant' | 'specialist'
  final String? role;

  bool get isAuthenticated => status == AuthStatus.authenticated;

  /// pending-approval дэлгэц үзүүлэх эсэх
  bool get needsApproval => isAuthenticated && isApproved == false;

  AuthState copyWith({
    AuthStatus? status,
    Session? session,
    String? error,
    bool? isApproved,
    String? role,
  }) {
    return AuthState(
      status: status ?? this.status,
      session: session ?? this.session,
      error: error,
      isApproved: isApproved ?? this.isApproved,
      role: role ?? this.role,
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
        state = AuthState(status: AuthStatus.authenticated, session: session);
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
        // Профайл олдоогүй бол баталгаажаагүй гэж үзнэ
        state = state.copyWith(isApproved: false, role: 'participant');
      }
    } catch (e) {
      // profiles хүснэгт байхгүй / RLS алдаа → нэвтэрч байгаа ч баталгаажаагүй гэж үзнэ
      // Crash болохоос сэргийлж graceful fallback хийнэ
      debugPrint('[AuthNotifier] profile fetch failed (table missing / RLS): $e');
      state = state.copyWith(isApproved: false, role: 'participant');
    }
  }

  /// Email OTP илгээх
  Future<void> sendOtp(String email) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      await _client.auth.signInWithOtp(email: email);
      state = state.copyWith(status: AuthStatus.unauthenticated);
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: e.toString(),
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

  /// Sign out
  Future<void> signOut() async {
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
