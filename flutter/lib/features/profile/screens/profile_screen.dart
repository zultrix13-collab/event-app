import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:event_app/features/auth/providers/auth_provider.dart';

// ---------------------------------------------------------------------------
// ProfileScreen — Хэрэглэгчийн профайл, QR ID карт, гарах
// ---------------------------------------------------------------------------

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final theme = Theme.of(context);

    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final email = user.email ?? '';
    final metadata = user.userMetadata ?? {};
    final fullName = metadata['full_name'] as String? ??
        metadata['name'] as String? ??
        email.split('@').first;
    final role = metadata['role'] as String? ?? 'participant';
    final initials = _getInitials(fullName);

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

          // Digital ID card with QR
          _DigitalIdCard(qrData: email, fullName: fullName, role: role),
          const SizedBox(height: 24),

          // Menu items
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.notifications_outlined),
                  title: const Text('Мэдэгдлүүд'), // Notifications
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {}, // TODO: navigate to notifications
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.settings_outlined),
                  title: const Text('Тохиргоо'), // Settings
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/settings'),
                ),
                if (role == 'participant') ...[
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.star_outline),
                    title: const Text('VIP эрх хүсэх'), // Apply for VIP
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/apply-vip'),
                  ),
                ],
                const Divider(height: 1),
                ListTile(
                  leading: Icon(
                    Icons.logout,
                    color: theme.colorScheme.error,
                  ),
                  title: Text(
                    'Гарах', // Sign out
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
      'specialist' => ('Мэргэжилтэн', Colors.blue), // Specialist
      _ => ('Оролцогч', Colors.green),               // Participant
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
        style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 13),
      ),
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
  });

  final String qrData;
  final String fullName;
  final String role;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
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
                  'Цахим үнэмлэх', // Digital ID
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 16),
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
              style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 4),
            Text(
              qrData,
              style: theme.textTheme.bodySmall
                  ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
            ),
          ],
        ),
      ),
    );
  }
}
