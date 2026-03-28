// App configuration from dart-define environment variables.
//
// Pass values at build/run time:
//   flutter run \
//     --dart-define=SUPABASE_URL=https://xxx.supabase.co \
//     --dart-define=SUPABASE_ANON_KEY=eyJ... \
//     --dart-define=APP_URL=https://your-app.vercel.app

class AppConfig {
  AppConfig._();

  static const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://your-project.supabase.co',
  );

  static const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '',
  );

  static const appUrl = String.fromEnvironment(
    'APP_URL',
    defaultValue: 'https://your-app.vercel.app',
  );

  /// Returns true when the app has been configured with real credentials.
  /// False when running with default/placeholder values.
  static bool get isConfigured =>
      supabaseUrl != 'https://your-project.supabase.co' &&
      supabaseAnonKey.isNotEmpty;
}
