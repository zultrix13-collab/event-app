import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/l10n/app_localizations.dart';
import 'package:event_app/features/notifications/models/notification_item.dart';
import 'package:event_app/features/notifications/providers/realtime_provider.dart';
import 'package:event_app/features/notifications/services/realtime_notification_service.dart';

// ---------------------------------------------------------------------------
// AppShell — ShellRoute wrapper with Material 3 NavigationBar
// ---------------------------------------------------------------------------

class AppShell extends ConsumerStatefulWidget {
  const AppShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell> {
  static const _icons = [
    (icon: Icons.home_outlined, active: Icons.home),
    (icon: Icons.calendar_month_outlined, active: Icons.calendar_month),
    (icon: Icons.map_outlined, active: Icons.map),
    (icon: Icons.store_outlined, active: Icons.store),
    (icon: Icons.person_outline, active: Icons.person),
  ];

  @override
  void initState() {
    super.initState();
    RealtimeNotificationService.instance.addListener(_showNotificationSnackBar);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(realtimeNotificationsProvider.notifier);
    });
  }

  @override
  void dispose() {
    RealtimeNotificationService.instance
        .removeListener(_showNotificationSnackBar);
    RealtimeNotificationService.instance.unsubscribe();
    super.dispose();
  }

  void _showNotificationSnackBar(NotificationItem item) {
    if (!mounted) return;
    final body = item.body.length > 80
        ? '${item.body.substring(0, 77)}...'
        : item.body;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              item.title,
              style: const TextStyle(fontWeight: FontWeight.bold),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            if (body.isNotEmpty)
              Text(body, maxLines: 2, overflow: TextOverflow.ellipsis),
          ],
        ),
        duration: const Duration(seconds: 4),
        behavior: SnackBarBehavior.floating,
        action: SnackBarAction(
          label: 'Харах',
          onPressed: () => context.push('/notifications'),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final labels = [
      l10n.home,
      l10n.programme,
      l10n.map,
      l10n.services,
      l10n.profile,
    ];

    return Scaffold(
      body: widget.navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: widget.navigationShell.currentIndex,
        onDestinationSelected: _onTap,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: List.generate(
          _icons.length,
          (i) => NavigationDestination(
            icon: Icon(_icons[i].icon),
            selectedIcon: Icon(_icons[i].active),
            label: labels[i],
          ),
        ),
      ),
    );
  }

  void _onTap(int index) {
    widget.navigationShell.goBranch(
      index,
      initialLocation: index == widget.navigationShell.currentIndex,
    );
  }
}
