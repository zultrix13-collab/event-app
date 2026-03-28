import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_map_tile_caching/flutter_map_tile_caching.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/core/config/app_config.dart';
import 'package:event_app/core/notifications/local_notification_service.dart';
import 'package:event_app/core/router/app_router.dart';
import 'package:event_app/core/supabase/supabase_client.dart';
import 'package:event_app/core/theme/app_theme.dart';
import 'package:event_app/core/providers/locale_provider.dart';
import 'package:event_app/core/providers/theme_provider.dart';
import 'package:event_app/l10n/app_localizations.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Warn if app is running without real credentials (debug builds only)
  if (kDebugMode && !AppConfig.isConfigured) {
    debugPrint(
      '⚠️ WARNING: App not configured. Run with --dart-define flags:\n'
      '  --dart-define=SUPABASE_URL=https://xxx.supabase.co\n'
      '  --dart-define=SUPABASE_ANON_KEY=eyJ...\n'
      '  --dart-define=APP_URL=https://your-app.vercel.app',
    );
  }

  // Initialize FMTC (offline map tile caching) with ObjectBox backend
  await FMTCObjectBoxBackend().initialise();

  // Create the default map store if it doesn't exist yet
  final store = FMTCStore('eventMapStore');
  if (!await store.manage.ready) {
    await store.manage.create();
  }

  // Initialize local notifications (used for foreground FCM messages)
  await LocalNotificationService.initialize();

  // PushNotificationService.instance.initialize(); // Uncomment after Firebase setup

  await SupabaseConfig.init(
    supabaseUrl: AppConfig.supabaseUrl,
    supabaseAnonKey: AppConfig.supabaseAnonKey,
  );

  runApp(
    const ProviderScope(
      child: EventApp(),
    ),
  );
}

class EventApp extends ConsumerWidget {
  const EventApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final locale = ref.watch(localeProvider);
    final themeMode = ref.watch(themeProvider);

    return MaterialApp.router(
      title: 'Арга хэмжээ',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      locale: locale,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('mn'),
        Locale('en'),
      ],
    );
  }
}
