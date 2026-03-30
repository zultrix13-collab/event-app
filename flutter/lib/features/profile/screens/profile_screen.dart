import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:event_app/features/auth/providers/auth_provider.dart';
import 'package:event_app/core/supabase/supabase_client.dart';

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
    final user = ref.watch(currentUserProvider);
    final authState = ref.watch(authProvider);
    final theme = Theme.of(context);

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

    // VIP or Specialist gets Digital ID section
    final hasDigitalId = role == 'vip' || role == 'specialist';

    return Scaffold(
      appBar: AppBar(title: const Text('Профайл')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Avatar + name + email
          _AvatarSection(
            initials: initials,
            fullName: fullName,
            email: email,
            role: role,
          ),
          const SizedBox(height: 24),

          // Digital ID card — only for VIP / Specialist
          if (hasDigitalId) ...[
            _DigitalIdSection(userId: user.id, fullName: fullName, role: role),
            const SizedBox(height: 24),
          ],

          // Menu items
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.notifications_outlined),
                  title: const Text('Мэдэгдлүүд'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.settings_outlined),
                  title: const Text('Тохиргоо'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/settings'),
                ),
                if (role == 'participant') ...[
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.star_outline),
                    title: const Text('VIP эрх хүсэх'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/apply-vip'),
                  ),
                ],
                const Divider(height: 1),
                ListTile(
                  leading: Icon(Icons.logout, color: theme.colorScheme.error),
                  title: Text(
                    'Гарах',
                    style: TextStyle(color: theme.colorScheme.error),
                  ),
                  onTap: () => _signOut(context, ref),
                ),
              ],
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

  String _getInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
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
        qrData: userId, // Fallback to userId
        fullName: fullName,
        role: role,
        expiresAt: null,
        isRevoked: false,
      ),
      data: (data) {
        if (data == null) {
          // No digital ID issued yet
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Row(
                    children: [
                      Icon(Icons.badge_outlined,
                          color: Theme.of(context).colorScheme.primary),
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
                        color: Theme.of(context).colorScheme.onSurfaceVariant),
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
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              children: [
                Icon(Icons.badge_outlined, color: theme.colorScheme.primary),
                const SizedBox(width: 8),
                Text(
                  'Цахим үнэмлэх',
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: badgeColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: badgeColor.withOpacity(0.4)),
                  ),
                  child: Text(
                    badgeText,
                    style: TextStyle(
                        color: badgeColor,
                        fontSize: 11,
                        fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (isRevoked || isExpired)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.withOpacity(0.2)),
                ),
                child: Text(
                  isRevoked
                      ? 'Энэ цахим үнэмлэх хүчингүй болсон.'
                      : 'Цахим үнэмлэхийн хугацаа дууссан. Шинэчлэлт авахын тулд админ-д хандана уу.',
                  textAlign: TextAlign.center,
                  style:
                      TextStyle(color: Colors.red[700], fontSize: 13),
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
// Avatar section
// ---------------------------------------------------------------------------

class _AvatarSection extends StatelessWidget {
  const _AvatarSection({
    required this.initials,
    required this.fullName,
    required this.email,
    required this.role,
  });

  final String initials;
  final String fullName;
  final String email;
  final String role;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      children: [
        CircleAvatar(
          radius: 40,
          backgroundColor: theme.colorScheme.primary,
          child: Text(
            initials,
            style: theme.textTheme.headlineMedium?.copyWith(
              color: theme.colorScheme.onPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          fullName,
          style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(email, style: theme.textTheme.bodyMedium),
        const SizedBox(height: 8),
        _RoleBadge(role: role),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Role badge
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
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Text(
        label,
        style: TextStyle(
            color: color, fontWeight: FontWeight.w600, fontSize: 13),
      ),
    );
  }
}
