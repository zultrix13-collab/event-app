import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:event_app/core/theme/app_theme.dart';
import 'package:event_app/features/auth/providers/auth_provider.dart';
import 'package:event_app/core/supabase/supabase_client.dart';
import 'package:event_app/core/providers/locale_provider.dart';
import 'package:event_app/l10n/app_localizations.dart';

// ---------------------------------------------------------------------------
// ProfileScreen — Хэрэглэгчийн профайл, QR ID карт, гарах
// ---------------------------------------------------------------------------

/// Provider: fetch digital_id record for current user
final digitalIdProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return null;

  try {
    final data = await SupabaseConfig.client
        .from('digital_ids')
        .select('qr_payload, hmac_signature, expires_at, is_revoked')
        .eq('user_id', user.id)
        .maybeSingle();
    return data;
  } catch (e) {
    return null;
  }
});

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final user = ref.watch(currentUserProvider);
    final authState = ref.watch(authProvider);

    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final email = user.email ?? '';
    final metadata = user.userMetadata ?? {};
    final fullName = metadata['full_name'] as String? ??
        metadata['name'] as String? ??
        email.split('@').first;
    final role = authState.role ?? metadata['role'] as String? ?? 'participant';
    final initials = _getInitials(fullName);

    final hasDigitalId = role == 'vip' || role == 'specialist';

    return Scaffold(
      backgroundColor: AppTheme.surface,
      body: CustomScrollView(
        slivers: [
          // Gradient header
          SliverToBoxAdapter(
            child: _ProfileHeader(
              initials: initials,
              fullName: fullName,
              email: email,
              role: role,
              l10n: l10n,
            ),
          ),
          // Stats row
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
            sliver: SliverToBoxAdapter(child: _StatsRow(l10n: l10n)),
          ),
          // Digital ID
          if (hasDigitalId)
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
              sliver: SliverToBoxAdapter(
                child: _DigitalIdSection(
                  userId: user.id,
                  fullName: fullName,
                  role: role,
                ),
              ),
            ),
          // Settings list
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
            sliver: SliverToBoxAdapter(
              child: _SettingsList(
                role: role,
                l10n: l10n,
                onSignOut: () => _signOut(context, ref),
                onLanguage: () => _showLanguageSheet(context, ref),
                context: context,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _signOut(BuildContext context, WidgetRef ref) async {
    await ref.read(authProvider.notifier).signOut();
    if (context.mounted) context.go('/login');
  }

  void _showLanguageSheet(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final currentLocale = ref.read(localeProvider);

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Drag handle
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              l10n.selectLanguage,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 20),
            // Mongolian option
            _LanguageOption(
              flag: '🇲🇳',
              name: l10n.languageMongolian,
              isSelected: currentLocale.languageCode == 'mn',
              onTap: () {
                ref.read(localeProvider.notifier).setLocale(const Locale('mn'));
                Navigator.pop(ctx);
              },
            ),
            const SizedBox(height: 12),
            // English option
            _LanguageOption(
              flag: '🇬🇧',
              name: l10n.languageEnglish,
              isSelected: currentLocale.languageCode == 'en',
              onTap: () {
                ref.read(localeProvider.notifier).setLocale(const Locale('en'));
                Navigator.pop(ctx);
              },
            ),
          ],
        ),
      ),
    );
  }

  String _getInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
}

// ---------------------------------------------------------------------------
// Profile Header — gradient with initials avatar + language chip
// ---------------------------------------------------------------------------

class _ProfileHeader extends StatelessWidget {
  final String initials, fullName, email, role;
  final AppLocalizations l10n;
  const _ProfileHeader({
    required this.initials,
    required this.fullName,
    required this.email,
    required this.role,
    required this.l10n,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: AppTheme.gradientHero,
        borderRadius: BorderRadius.vertical(
          bottom: Radius.circular(AppTheme.radiusXXL),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
          child: Column(
            children: [
              // App bar row
              Row(
                children: [
                  Text(
                    l10n.profile,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.5,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Avatar with gradient ring
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: AppTheme.gradientPrimary,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.white.withValues(alpha: 0.3),
                      blurRadius: 16,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(3),
                  child: Container(
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Color(0xFF5B5FE8),
                    ),
                    child: Center(
                      child: Text(
                        initials,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                fullName,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                email,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.75),
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 10),
              _RoleBadgeLight(role: role, l10n: l10n),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleBadgeLight extends StatelessWidget {
  final String role;
  final AppLocalizations l10n;
  const _RoleBadgeLight({required this.role, required this.l10n});

  @override
  Widget build(BuildContext context) {
    final (label, icon) = switch (role) {
      'vip' => (l10n.roleVip, Icons.star_rounded),
      'specialist' => (l10n.roleSpecialist, Icons.verified_rounded),
      'super_admin' => (l10n.roleSuperAdmin, Icons.admin_panel_settings_rounded),
      _ => (l10n.roleParticipant, Icons.person_rounded),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 14),
          const SizedBox(width: 5),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Stats Row
// ---------------------------------------------------------------------------

class _StatsRow extends StatelessWidget {
  final AppLocalizations l10n;
  const _StatsRow({required this.l10n});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _StatCard(icon: Icons.event_available_rounded, value: '3', label: l10n.profileSessions)),
        const SizedBox(width: 10),
        Expanded(child: _StatCard(icon: Icons.eco_rounded, value: '120', label: l10n.profileSteps)),
        const SizedBox(width: 10),
        Expanded(child: _StatCard(icon: Icons.star_rounded, value: '2', label: l10n.profileBadges)),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String value, label;
  const _StatCard({required this.icon, required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusLG),
        boxShadow: const [
          BoxShadow(color: Color(0x0D000000), blurRadius: 8, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppTheme.primary, size: 20),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1A1A2E),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Settings List
// ---------------------------------------------------------------------------

class _SettingsList extends StatelessWidget {
  final String role;
  final AppLocalizations l10n;
  final VoidCallback onSignOut;
  final VoidCallback onLanguage;
  final BuildContext context;
  const _SettingsList({
    required this.role,
    required this.l10n,
    required this.onSignOut,
    required this.onLanguage,
    required this.context,
  });

  @override
  Widget build(BuildContext _) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppTheme.radiusLG),
      ),
      child: Column(
        children: [
          _SettingsTile(
            icon: Icons.settings_outlined,
            title: l10n.profileSettings,
            onTap: () => context.push('/settings'),
          ),
          const Divider(height: 1, indent: 56),
          _SettingsTile(
            icon: Icons.notifications_outlined,
            title: l10n.profileNotifications,
            onTap: () => context.push('/notifications'),
          ),
          const Divider(height: 1, indent: 56),
          _SettingsTile(
            icon: Icons.language_rounded,
            title: l10n.profileLanguage,
            onTap: onLanguage,
          ),
          if (role == 'participant') ...[
            const Divider(height: 1, indent: 56),
            _SettingsTile(
              icon: Icons.star_outline_rounded,
              title: 'VIP эрх хүсэх',
              onTap: () => context.push('/apply-vip'),
            ),
          ],
          const Divider(height: 1, indent: 56),
          _SettingsTile(
            icon: Icons.logout_rounded,
            title: l10n.profileSignOut,
            titleColor: AppTheme.danger,
            iconColor: AppTheme.danger,
            onTap: onSignOut,
          ),
        ],
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color? iconColor;
  final Color? titleColor;
  final VoidCallback? onTap;

  const _SettingsTile({
    required this.icon,
    required this.title,
    this.iconColor,
    this.titleColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final iColor = iconColor ?? AppTheme.primary;
    final tColor = titleColor ?? const Color(0xFF1A1A2E);

    return ListTile(
      leading: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: iColor.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: iColor, size: 18),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w500,
          color: tColor,
        ),
      ),
      trailing: Icon(
        Icons.chevron_right_rounded,
        color: Colors.grey[400],
        size: 20,
      ),
      onTap: onTap,
    );
  }
}

// ---------------------------------------------------------------------------
// Language Option Widget (for bottom sheet)
// ---------------------------------------------------------------------------

class _LanguageOption extends StatelessWidget {
  final String flag, name;
  final bool isSelected;
  final VoidCallback onTap;

  const _LanguageOption({
    required this.flag,
    required this.name,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF6366F1).withValues(alpha: 0.08)
              : Colors.grey[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF6366F1) : Colors.grey[200]!,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Text(flag, style: const TextStyle(fontSize: 24)),
            const SizedBox(width: 12),
            Text(
              name,
              style: TextStyle(
                fontSize: 16,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected
                    ? const Color(0xFF6366F1)
                    : const Color(0xFF374151),
              ),
            ),
            const Spacer(),
            if (isSelected)
              const Icon(
                Icons.check_circle_rounded,
                color: Color(0xFF6366F1),
                size: 22,
              ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Digital ID Section — fetches from digital_ids table
// ---------------------------------------------------------------------------

class _DigitalIdSection extends ConsumerWidget {
  const _DigitalIdSection({
    required this.userId,
    required this.fullName,
    required this.role,
  });

  final String userId;
  final String fullName;
  final String role;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final digitalIdAsync = ref.watch(digitalIdProvider);

    return digitalIdAsync.when(
      loading: () => const Card(
        child: Padding(
          padding: EdgeInsets.all(20),
          child: Center(child: CircularProgressIndicator()),
        ),
      ),
      error: (_, __) => _DigitalIdCard(
        qrData: userId,
        fullName: fullName,
        role: role,
        expiresAt: null,
        isRevoked: false,
      ),
      data: (data) {
        if (data == null) {
          return Card(
            elevation: 0,
            color: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppTheme.radiusLG),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Icon(Icons.badge_outlined, color: AppTheme.primary),
                      const SizedBox(width: 8),
                      Text(
                        'Цахим үнэмлэх',
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Цахим үнэмлэх үүсгэгдээгүй байна.\nАдмин-д хандана уу.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        final qrPayload = data['qr_payload'] as String? ?? userId;
        final expiresAtStr = data['expires_at'] as String?;
        final isRevoked = data['is_revoked'] as bool? ?? false;
        final expiresAt =
            expiresAtStr != null ? DateTime.tryParse(expiresAtStr) : null;

        return _DigitalIdCard(
          qrData: qrPayload,
          fullName: fullName,
          role: role,
          expiresAt: expiresAt,
          isRevoked: isRevoked,
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Digital ID card with QR code
// ---------------------------------------------------------------------------

class _DigitalIdCard extends StatelessWidget {
  const _DigitalIdCard({
    required this.qrData,
    required this.fullName,
    required this.role,
    required this.expiresAt,
    required this.isRevoked,
  });

  final String qrData;
  final String fullName;
  final String role;
  final DateTime? expiresAt;
  final bool isRevoked;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isExpired = expiresAt != null && DateTime.now().isAfter(expiresAt!);
    final badgeColor = isRevoked || isExpired ? Colors.red : Colors.green;
    final badgeText = isRevoked
        ? '✗ Хүчингүй болсон'
        : isExpired
            ? '✗ Хугацаа дууссан'
            : '✓ Хүчинтэй';

    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppTheme.radiusLG),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              children: [
                const Icon(Icons.badge_outlined, color: AppTheme.primary),
                const SizedBox(width: 8),
                Text(
                  'Цахим үнэмлэх',
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: badgeColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: badgeColor.withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    badgeText,
                    style: TextStyle(
                      color: badgeColor,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (isRevoked || isExpired)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.withValues(alpha: 0.2)),
                ),
                child: Text(
                  isRevoked
                      ? 'Энэ цахим үнэмлэх хүчингүй болсон.'
                      : 'Цахим үнэмлэхийн хугацаа дууссан. Шинэчлэлт авахын тулд админ-д хандана уу.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.red[700], fontSize: 13),
                ),
              )
            else
              QrImageView(
                data: qrData,
                version: QrVersions.auto,
                size: 160,
                eyeStyle: QrEyeStyle(
                  eyeShape: QrEyeShape.square,
                  color: theme.colorScheme.onSurface,
                ),
                dataModuleStyle: QrDataModuleStyle(
                  dataModuleShape: QrDataModuleShape.square,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            const SizedBox(height: 12),
            Text(
              fullName,
              style: theme.textTheme.bodyLarge
                  ?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 4),
            _RoleBadge(role: role),
            if (expiresAt != null && !isRevoked) ...[
              const SizedBox(height: 6),
              Text(
                'Дуусах: ${_formatDate(expiresAt!)}',
                style: theme.textTheme.bodySmall
                    ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
  }
}

// ---------------------------------------------------------------------------
// Role badge (dark version for card usage)
// ---------------------------------------------------------------------------

class _RoleBadge extends StatelessWidget {
  const _RoleBadge({required this.role});
  final String role;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (role) {
      'vip' => ('VIP', Colors.amber),
      'specialist' => ('Мэргэжилтэн', Colors.blue),
      _ => ('Оролцогч', Colors.green),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w600,
          fontSize: 13,
        ),
      ),
    );
  }
}
