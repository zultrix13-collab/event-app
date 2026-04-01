import 'package:supabase_flutter/supabase_flutter.dart';

/// Supabase client singleton accessor
/// Initialize once in main.dart via SupabaseConfig.init()
class SupabaseConfig {
  SupabaseConfig._();

  /// Call this before runApp()
  static Future<void> init({
    required String supabaseUrl,
    required String supabaseAnonKey,
  }) async {
    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
        detectSessionInUri: true,
      ),
    );
  }

  /// Shorthand accessor for the Supabase client
  static SupabaseClient get client => Supabase.instance.client;
}
