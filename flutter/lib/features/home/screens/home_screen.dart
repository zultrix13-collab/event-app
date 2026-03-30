import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/core/theme/app_theme.dart';
import 'package:event_app/features/auth/providers/auth_provider.dart';
import 'package:event_app/features/notifications/providers/notifications_provider.dart';
import 'package:event_app/l10n/app_localizations.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final user = ref.watch(currentUserProvider);
    final metadata = user?.userMetadata ?? {};
    final fullName = metadata['full_name'] as String? ??
        metadata['name'] as String? ??
        user?.email?.split('@').first ??
        'Зочин';
    final emergencyAsync = ref.watch(emergencyNotificationsProvider);
    final hasEmergency = emergencyAsync.valueOrNull?.isNotEmpty ?? false;

    return Scaffold(
      backgroundColor: AppTheme.surface,
      floatingActionButton: const _PulseFab(),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: _HeroSection(
              fullName: fullName,
              hasEmergency: hasEmergency,
              l10n: l10n,
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
            sliver: SliverToBoxAdapter(child: _SectionTitle(l10n.quickAccess)),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.3,
              ),
              delegate: SliverChildListDelegate([
                _QuickActionCard(
                  label: l10n.programme,
                  icon: Icons.calendar_month_rounded,
                  route: '/programme',
                  gradient: const LinearGradient(
                    colors: [Color(0xFF3B82F6), Color(0xFF1D4ED8)],
                  ),
                ),
                _QuickActionCard(
                  label: l10n.map,
                  icon: Icons.map_rounded,
                  route: '/map',
                  gradient: const LinearGradient(
                    colors: [Color(0xFF10B981), Color(0xFF059669)],
                  ),
                ),
                _QuickActionCard(
                  label: l10n.services,
                  icon: Icons.storefront_rounded,
                  route: '/services',
                  gradient: const LinearGradient(
                    colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                  ),
                ),
                _QuickActionCard(
                  label: l10n.green,
                  icon: Icons.eco_rounded,
                  route: '/green',
                  gradient: const LinearGradient(
                    colors: [Color(0xFF06B6D4), Color(0xFF0284C7)],
                  ),
                ),
              ]),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
            sliver: SliverToBoxAdapter(child: _SectionTitle(l10n.nextSession)),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            sliver: SliverToBoxAdapter(child: _NextSessionCard(l10n: l10n)),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);
  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 17,
        fontWeight: FontWeight.w700,
        color: Color(0xFF1A1A2E),
      ),
    );
  }
}

class _HeroSection extends StatelessWidget {
  final String fullName;
  final bool hasEmergency;
  final AppLocalizations l10n;
  const _HeroSection({
    required this.fullName,
    required this.hasEmergency,
    required this.l10n,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 210,
      decoration: const BoxDecoration(
        gradient: AppTheme.gradientHero,
        borderRadius: BorderRadius.vertical(
          bottom: Radius.circular(AppTheme.radiusXXL),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 16, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          l10n.welcomeGreeting,
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.85),
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          fullName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      IconButton(
                        icon: const Icon(
                          Icons.notifications_outlined,
                          color: Colors.white,
                        ),
                        onPressed: () => GoRouter.of(context).go('/notifications'),
                      ),
                      if (hasEmergency)
                        Positioned(
                          right: 8,
                          top: 8,
                          child: Container(
                            width: 10,
                            height: 10,
                            decoration: const BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
              const Spacer(),
              _CountdownRow(l10n: l10n),
            ],
          ),
        ),
      ),
    );
  }
}

class _CountdownRow extends StatelessWidget {
  final AppLocalizations l10n;
  const _CountdownRow({required this.l10n});

  @override
  Widget build(BuildContext context) {
    final event = DateTime(2026, 5, 15);
    final now = DateTime.now();
    final diff = event.difference(now);
    final days = diff.inDays.clamp(0, 999);
    final hours = (diff.inHours % 24).clamp(0, 23);
    final mins = (diff.inMinutes % 60).clamp(0, 59);

    return Row(
      children: [
        _TimeChip('$days', l10n.countdownDays),
        const SizedBox(width: 8),
        _TimeChip('$hours', l10n.countdownHours),
        const SizedBox(width: 8),
        _TimeChip('$mins', l10n.countdownMins),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            l10n.eventCountdown,
            style: const TextStyle(color: Colors.white, fontSize: 11),
          ),
        ),
      ],
    );
  }
}

class _TimeChip extends StatelessWidget {
  final String value, label;
  const _TimeChip(this.value, this.label);
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.8),
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final String label, route;
  final IconData icon;
  final LinearGradient gradient;
  const _QuickActionCard({
    required this.label,
    required this.icon,
    required this.route,
    required this.gradient,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.go(route),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppTheme.radiusLG),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0D000000),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                gradient: gradient,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: Colors.white, size: 22),
            ),
            const Spacer(),
            Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1A1A2E),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NextSessionCard extends StatelessWidget {
  final AppLocalizations l10n;
  const _NextSessionCard({required this.l10n});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusLG),
        boxShadow: const [
          BoxShadow(color: Color(0x0D000000), blurRadius: 8, offset: Offset(0, 2)),
        ],
        border: const Border(
          left: BorderSide(color: AppTheme.primary, width: 4),
        ),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(
              child: Text(
                '09:00',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.primary,
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.openingCeremony,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1A1A2E),
                  ),
                ),
                const SizedBox(height: 4),
                const Row(
                  children: [
                    Icon(Icons.location_on_outlined, size: 14, color: Color(0xFF9CA3AF)),
                    SizedBox(width: 4),
                    Text(
                      'Main Hall',
                      style: TextStyle(fontSize: 13, color: Color(0xFF9CA3AF)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: Color(0xFF9CA3AF)),
        ],
      ),
    );
  }
}

class _PulseFab extends StatefulWidget {
  const _PulseFab();
  @override
  State<_PulseFab> createState() => _PulseFabState();
}

class _PulseFabState extends State<_PulseFab> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
    _scale = Tween<double>(begin: 1.0, end: 1.5).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        AnimatedBuilder(
          animation: _scale,
          builder: (ctx, _) => Transform.scale(
            scale: _scale.value,
            child: Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.primary.withValues(
                  alpha: 0.15 * (2.5 - _scale.value),
                ),
              ),
            ),
          ),
        ),
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            gradient: AppTheme.gradientPrimary,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppTheme.primary.withValues(alpha: 0.4),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: IconButton(
            icon: const Icon(
              Icons.chat_bubble_outline_rounded,
              color: Colors.white,
              size: 22,
            ),
            onPressed: () => context.push('/chat'),
          ),
        ),
      ],
    );
  }
}
