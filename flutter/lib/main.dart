import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:saas_base/core/router/app_router.dart';
import 'package:saas_base/core/supabase/supabase_client.dart';
import 'package:saas_base/core/theme/app_theme.dart';

// ---------------------------------------------------------------------------
// TODO: Production-д .env эсвэл envied ашиглах
// Хөгжүүлэлтийн үед энд утга оруулна
// ---------------------------------------------------------------------------
const _supabaseUrl = String.fromEnvironment(
  'SUPABASE_URL',
  defaultValue: 'https://your-project.supabase.co',
);
const _supabaseAnonKey = String.fromEnvironment(
  'SUPABASE_ANON_KEY',
  defaultValue: 'your-anon-key',
);

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Supabase эхлүүлэх
  await SupabaseConfig.init(
    supabaseUrl: _supabaseUrl,
    supabaseAnonKey: _supabaseAnonKey,
  );

  runApp(
    // Riverpod wrapper
    const ProviderScope(
      child: SaasApp(),
    ),
  );
}

class SaasApp extends ConsumerWidget {
  const SaasApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'SaaS Base', // TODO: SaaS-ийн нэрийг өөрчлөх
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
