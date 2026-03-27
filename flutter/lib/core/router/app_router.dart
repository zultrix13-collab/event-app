import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:saas_base/features/auth/providers/auth_provider.dart';
import 'package:saas_base/features/auth/screens/login_screen.dart';
import 'package:saas_base/features/auth/screens/verify_screen.dart';
import 'package:saas_base/features/home/screens/home_screen.dart';
import 'package:saas_base/features/organization/providers/org_provider.dart';
import 'package:saas_base/features/organization/screens/org_screen.dart';
import 'package:saas_base/features/organization/screens/setup_org_screen.dart';
import 'package:saas_base/features/subscription/screens/subscription_screen.dart';

// ---------------------------------------------------------------------------
// Router Provider
// ---------------------------------------------------------------------------

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  final orgState = ref.watch(orgProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggedIn = authState.isAuthenticated;
      final isLoading = authState.status == AuthStatus.loading;
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/verify';

      // Loading үед redirect хийхгүй
      if (isLoading) return null;

      // Нэвтрээгүй бол login руу
      if (!isLoggedIn && !isAuthRoute) return '/login';

      // Нэвтэрсэн бол auth route-аас гарах
      if (isLoggedIn && isAuthRoute) {
        // Org байхгүй бол setup руу
        if (!orgState.isLoading && !orgState.hasOrg) return '/setup-org';
        return '/home';
      }

      // Нэвтэрсэн, org байхгүй
      if (isLoggedIn &&
          !orgState.isLoading &&
          !orgState.hasOrg &&
          state.matchedLocation != '/setup-org') {
        return '/setup-org';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: '/verify',
        builder: (_, state) {
          final email = state.extra as String? ?? '';
          return VerifyScreen(email: email);
        },
      ),
      GoRoute(
        path: '/setup-org',
        builder: (_, __) => const SetupOrgScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (_, __) => const HomeScreen(),
      ),
      GoRoute(
        path: '/org',
        builder: (_, __) => const OrgScreen(),
      ),
      GoRoute(
        path: '/subscription',
        builder: (_, __) => const SubscriptionScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48),
            const SizedBox(height: 16),
            Text('Хуудас олдсонгүй: ${state.uri}'),
            TextButton(
              onPressed: () => GoRouter.of(context).go('/home'),
              child: const Text('Нүүр хуудас'),
            ),
          ],
        ),
      ),
    ),
  );
});
