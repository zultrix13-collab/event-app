import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_map_tile_caching/flutter_map_tile_caching.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/core/config/app_config.dart';
import 'package:event_app/core/notifications/local_notification_service.dart';
import 'package:event_app/core/notifications/firebase_messaging_service.dart';
import 'package:event_app/core/router/app_router.dart';
import 'package:event_app/core/supabase/supabase_client.dart';
import 'package:event_app/core/theme/app_theme.dart';
import 'package:event_app/core/providers/locale_provider.dart';
import 'package:event_app/core/providers/theme_provider.dart';
import 'package:event_app/l10n/app_localizations.dart';

Future<void> main() async {
  debugPrint('🚀 App starting...');
  WidgetsFlutterBinding.ensureInitialized();
  debugPrint('✅ Flutter Binding Initialized');

  // Warn if app is running without real credentials (debug builds only)
  if (kDebugMode && !AppConfig.isConfigured) {
    debugPrint(
      '⚠️ WARNING: App not configured. Run with --dart-define flags:\n'
      '  --dart-define=SUPABASE_URL=https://xxx.supabase.co\n'
      '  --dart-define=SUPABASE_ANON_KEY=eyJ...\n'
      '  --dart-define=APP_URL=https://your-app.vercel.app',
    );
  }

  try {
    debugPrint('⏳ Initializing FMTCObjectBoxBackend...');
    // Initialize FMTC (offline map tile caching) with ObjectBox backend
    await FMTCObjectBoxBackend().initialise();
    debugPrint('✅ FMTC Backend Initialized');

    // Create the default map store if it doesn't exist yet
    final store = FMTCStore('eventMapStore');
    if (!await store.manage.ready) {
      await store.manage.create();
    }
    debugPrint('✅ FMTC Store Ready');

    // Initialize local notifications (used for foreground FCM messages)
    await LocalNotificationService.initialize();
    debugPrint('✅ Notification Service Initialized');

    debugPrint('⏳ Initializing Firebase...');
    try {
      await Firebase.initializeApp(
        options: const FirebaseOptions(
          apiKey: "AIzaSyDqCYcj9HReZ81T2xEmwO1BVOwMfhiz_6Q",
          authDomain: "eventapp-a0c77.firebaseapp.com",
          projectId: "eventapp-a0c77",
          storageBucket: "eventapp-a0c77.firebasestorage.app",
          messagingSenderId: "826817863788",
          appId: "1:826817863788:ios:e8bf09e22700bd7258f849",
          iosBundleId: "mn.devgrafx.eventapp",
        ),
      );
      // Initialize FCM (permissions, listeners, background handlers)
      await FirebaseMessagingService.initialize();
      debugPrint('✅ Firebase Initialized');
    } catch (firebaseError) {
      debugPrint(
        '⚠️ Firebase Initialization Failed: $firebaseError\n'
        '   (Push notifications and Google Sign-In will be disabled until '
        '    GoogleService-Info.plist is correctly configured.)',
      );
    }

    debugPrint('⏳ Initializing Supabase...');
    await SupabaseConfig.init(
      supabaseUrl: AppConfig.supabaseUrl,
      supabaseAnonKey: AppConfig.supabaseAnonKey,
    );
    debugPrint('✅ Supabase Initialized');

    runApp(
      const ProviderScope(
        child: EventApp(),
      ),
    );
    debugPrint('🚀 runApp() called');
  } catch (e, stack) {
    debugPrint('❌ FATAL ERROR DURING STARTUP: $e');
    debugPrint(stack.toString());
    runApp(
      MaterialApp(
        home: Scaffold(
          body: Center(
            child: Text('Error: $e'),
          ),
        ),
      ),
    );
  }
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
