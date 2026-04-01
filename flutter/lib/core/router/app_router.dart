import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/core/shell/app_shell.dart';
import 'package:event_app/features/auth/providers/auth_provider.dart';
import 'package:event_app/features/auth/screens/apply_vip_screen.dart';
import 'package:event_app/features/auth/screens/login_screen.dart';
import 'package:event_app/features/auth/screens/pending_approval_screen.dart';
import 'package:event_app/features/auth/screens/verify_screen.dart';
import 'package:event_app/features/green/screens/green_screen.dart';
import 'package:event_app/features/home/screens/home_screen.dart';
import 'package:event_app/features/map/screens/map_screen.dart';
import 'package:event_app/features/map/screens/offline_map_screen.dart';
import 'package:event_app/features/map/screens/qr_scanner_screen.dart';
import 'package:event_app/features/notifications/screens/notifications_screen.dart';
import 'package:event_app/features/profile/screens/profile_screen.dart';
import 'package:event_app/features/programme/screens/checkin_screen.dart';
import 'package:event_app/features/programme/screens/programme_screen.dart';
import 'package:event_app/features/programme/screens/session_detail_screen.dart';
import 'package:event_app/features/services/screens/cart_screen.dart';
import 'package:event_app/features/services/screens/hotel_screen.dart';
import 'package:event_app/features/services/screens/lost_found_screen.dart';
import 'package:event_app/features/chat/screens/chat_screen.dart';
import 'package:event_app/features/services/screens/restaurant_screen.dart';
import 'package:event_app/features/services/screens/services_screen.dart';
import 'package:event_app/features/services/screens/shop_screen.dart';
import 'package:event_app/features/services/screens/topup_screen.dart';
import 'package:event_app/features/services/screens/order_confirmation_screen.dart';
import 'package:event_app/features/services/screens/orders_screen.dart';
import 'package:event_app/features/services/screens/transport_screen.dart';
import 'package:event_app/features/services/screens/vendor_screen.dart';
import 'package:event_app/features/services/screens/wallet_screen.dart';
import 'package:event_app/features/profile/screens/settings_screen.dart';

// GoRouter-ийг auth state өөрчлөгдөх бүрт refresh хийх ChangeNotifier
class _AuthNotifierListenable extends ChangeNotifier {
  _AuthNotifierListenable(Ref ref) {
    ref.listen<AuthState>(authProvider, (_, __) => notifyListeners());
  }
}

// Auth routes that live OUTSIDE the shell
const _authRoutes = {
  '/login',
  '/verify',
  '/setup-org',
  '/pending-approval',
  '/apply-vip'
};

// ---------------------------------------------------------------------------
// Router Provider
// ---------------------------------------------------------------------------

final routerProvider = Provider<GoRouter>((ref) {
  final listenable = _AuthNotifierListenable(ref);

  return GoRouter(
    initialLocation: '/login',
    refreshListenable: listenable,
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final isLoggedIn = authState.isAuthenticated;
      final isLoading = authState.status == AuthStatus.loading;
      final currentPath = state.matchedLocation;
      final isAuthRoute = _authRoutes.contains(currentPath);

      // Loading үед redirect хийхгүй
      if (isLoading) return null;

      // Нэвтрээгүй бол login руу
      if (!isLoggedIn && !isAuthRoute) return '/login';

      // Нэвтэрсэн, баталгаажаагүй → pending-approval
      if (isLoggedIn && authState.needsApproval) {
        if (currentPath != '/pending-approval') return '/pending-approval';
        return null;
      }

      // Нэвтэрсэн хэрэглэгч auth дэлгэц дээр байвал үндсэн рүү оруулах
      if (isLoggedIn && isAuthRoute && currentPath != '/pending-approval') {
        return '/home';
      }

      return null;
    },
    routes: [
      // -----------------------------------------------------------------------
      // Auth routes (outside shell)
      // -----------------------------------------------------------------------
      GoRoute(
        path: '/login',
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: '/verify',
        builder: (_, state) {
          final emailFromQuery = state.uri.queryParameters['email'];
          final emailFromExtra = state.extra as String?;
          final email = emailFromQuery ?? emailFromExtra ?? '';
          return VerifyScreen(email: email);
        },
      ),
      GoRoute(
        path: '/setup-org',
        builder: (_, __) => const _SetupOrgPlaceholder(),
      ),
      GoRoute(
        path: '/pending-approval',
        builder: (_, __) => const PendingApprovalScreen(),
      ),
      GoRoute(
        path: '/apply-vip',
        builder: (_, __) => const ApplyVipScreen(),
      ),
      GoRoute(
        path: '/green',
        builder: (_, __) => const GreenScreen(),
      ),
      GoRoute(
        path: '/notifications',
        builder: (_, __) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/chat',
        builder: (_, __) => const ChatScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (_, __) => const SettingsScreen(),
      ),

      // -----------------------------------------------------------------------
      // Shell routes (with bottom nav)
      // -----------------------------------------------------------------------
      StatefulShellRoute.indexedStack(
        builder: (_, __, navigationShell) =>
            AppShell(navigationShell: navigationShell),
        branches: [
          // 🏠 Home
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/home',
              builder: (_, __) => const HomeScreen(),
            ),
          ]),

          // 📅 Programme
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/programme',
              builder: (_, __) => const ProgrammeScreen(),
              routes: [
                GoRoute(
                  path: 'checkin/:sessionId',
                  builder: (_, state) => CheckinScreen(
                    sessionId: state.pathParameters['sessionId']!,
                  ),
                ),
                GoRoute(
                  path: ':id',
                  builder: (_, state) => SessionDetailScreen(
                    sessionId: state.pathParameters['id']!,
                  ),
                ),
              ],
            ),
          ]),

          // 🗺️ Map
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/map',
              builder: (_, __) => const MapScreen(),
              routes: [
                GoRoute(
                  path: 'qr-scan',
                  builder: (_, __) => const QrScannerScreen(),
                ),
                GoRoute(
                  path: 'offline',
                  builder: (_, __) => const OfflineMapScreen(),
                ),
              ],
            ),
          ]),

          // 🛍️ Services
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/services',
              builder: (_, __) => const ServicesScreen(),
              routes: [
                GoRoute(
                  path: 'shop',
                  builder: (_, __) => const ShopScreen(),
                ),
                GoRoute(
                  path: 'cart',
                  builder: (_, __) => const CartScreen(),
                ),
                GoRoute(
                  path: 'wallet',
                  builder: (_, __) => const WalletScreen(),
                  routes: [
                    GoRoute(
                      path: 'topup',
                      builder: (_, __) => const TopUpScreen(),
                    ),
                  ],
                ),
                GoRoute(
                  path: 'transport',
                  builder: (_, __) => const TransportScreen(),
                ),
                GoRoute(
                  path: 'restaurant',
                  builder: (_, __) => const RestaurantScreen(),
                ),
                GoRoute(
                  path: 'hotel',
                  builder: (_, __) => const HotelScreen(),
                ),
                GoRoute(
                  path: 'lost-found',
                  builder: (_, __) => const LostFoundScreen(),
                ),
                GoRoute(
                  path: 'vendors',
                  builder: (_, __) => const VendorScreen(),
                ),
                GoRoute(
                  path: 'shop/orders',
                  builder: (_, __) => const OrdersScreen(),
                ),
                GoRoute(
                  path: 'shop/order-confirmation/:orderId',
                  builder: (_, state) => OrderConfirmationScreen(
                    orderId: state.pathParameters['orderId']!,
                  ),
                ),
              ],
            ),
          ]),

          // 👤 Profile
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/profile',
              builder: (_, __) => const ProfileScreen(),
            ),
          ]),
        ],
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

// ---------------------------------------------------------------------------
// Temporary placeholder for /setup-org (kept for router completeness)
// ---------------------------------------------------------------------------

class _SetupOrgPlaceholder extends StatelessWidget {
  const _SetupOrgPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Байгууллага тохируулах')),
      body: const Center(child: Text('Setup org — удахгүй')),
    );
  }
}
