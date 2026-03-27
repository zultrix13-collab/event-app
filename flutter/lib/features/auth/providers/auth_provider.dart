import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:saas_base/core/supabase/supabase_client.dart';

// ---------------------------------------------------------------------------
// Auth State
// ---------------------------------------------------------------------------

enum AuthStatus { loading, authenticated, unauthenticated }

class AuthState {
  const AuthState({
    this.status = AuthStatus.loading,
    this.session,
    this.error,
  });

  final AuthStatus status;
  final Session? session;
  final String? error;

  bool get isAuthenticated => status == AuthStatus.authenticated;

  AuthState copyWith({
    AuthStatus? status,
    Session? session,
    String? error,
  }) {
    return AuthState(
      status: status ?? this.status,
      session: session ?? this.session,
      error: error,
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
    // Current session шалгах
    final session = _client.auth.currentSession;
    if (session != null) {
      state = AuthState(status: AuthStatus.authenticated, session: session);
    } else {
      state = const AuthState(status: AuthStatus.unauthenticated);
    }

    // Auth state stream listen
    _client.auth.onAuthStateChange.listen((data) {
      final session = data.session;
      if (session != null) {
        state = AuthState(status: AuthStatus.authenticated, session: session);
      } else {
        state = const AuthState(status: AuthStatus.unauthenticated);
      }
    });
  }

  /// Email OTP илгээх
  Future<void> sendOtp(String email) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      await _client.auth.signInWithOtp(email: email);
      // OTP явуулсны дараа verify screen рүү router шилжүүлнэ
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

/// Convenience: current user
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authProvider).session?.user;
});
