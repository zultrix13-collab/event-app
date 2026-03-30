import 'package:event_app/core/config/env.dart';

// App configuration from dart-define environment variables.
//
// Pass values at build/run time:
//   flutter run \
//     --dart-define=SUPABASE_URL=https://xxx.supabase.co \
//     --dart-define=SUPABASE_ANON_KEY=eyJ...

class AppConfig {
  AppConfig._();

  static const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: Env.supabaseUrl,
  );

  static const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: Env.supabaseAnonKey,
  );

  static const appUrl = String.fromEnvironment(
    'APP_URL',
    defaultValue: 'https://your-app.vercel.app',
  );

  /// Returns true when the app has been configured with real credentials.
  static bool get isConfigured =>
      supabaseUrl != 'https://your-project.supabase.co' &&
      supabaseAnonKey != 'dummy_key';
}
