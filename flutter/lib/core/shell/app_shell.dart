import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/l10n/app_localizations.dart';
import 'package:event_app/core/theme/app_theme.dart';
import 'package:event_app/features/notifications/models/notification_item.dart';
import 'package:event_app/features/notifications/providers/realtime_provider.dart';
import 'package:event_app/features/notifications/services/realtime_notification_service.dart';

// ---------------------------------------------------------------------------
// AppShell — ShellRoute wrapper with floating bottom nav
// ---------------------------------------------------------------------------

class AppShell extends ConsumerStatefulWidget {
  const AppShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell> {
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

  void _onTap(int index) {
    widget.navigationShell.goBranch(
      index,
      initialLocation: index == widget.navigationShell.currentIndex,
    );
  }

  Widget _buildFloatingNav(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    final items = [
      (icon: Icons.home_outlined, activeIcon: Icons.home_rounded, label: l10n.navHome),
      (icon: Icons.calendar_month_outlined, activeIcon: Icons.calendar_month_rounded, label: l10n.navProgramme),
      (icon: Icons.map_outlined, activeIcon: Icons.map_rounded, label: l10n.navMap),
      (icon: Icons.store_outlined, activeIcon: Icons.storefront_rounded, label: l10n.navServices),
      (icon: Icons.person_outline_rounded, activeIcon: Icons.person_rounded, label: l10n.navProfile),
    ];
    final current = widget.navigationShell.currentIndex;

    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusXL),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withValues(alpha: 0.12),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: List.generate(items.length, (i) {
          final isSelected = i == current;
          return GestureDetector(
            onTap: () => _onTap(i),
            child: AnimatedContainer(
              duration: AppTheme.durationNormal,
              curve: AppTheme.curveDefault,
              padding: EdgeInsets.symmetric(
                horizontal: isSelected ? 14 : 12,
                vertical: 8,
              ),
              decoration: isSelected
                  ? BoxDecoration(
                      gradient: AppTheme.gradientPrimary,
                      borderRadius: BorderRadius.circular(AppTheme.radiusMD),
                    )
                  : null,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    isSelected ? items[i].activeIcon : items[i].icon,
                    color: isSelected ? Colors.white : Colors.grey[500],
                    size: 22,
                  ),
                  if (isSelected) ...[
                    const SizedBox(width: 6),
                    Text(
                      items[i].label,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        }),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.navigationShell,
      bottomNavigationBar: _buildFloatingNav(context),
    );
  }
}
