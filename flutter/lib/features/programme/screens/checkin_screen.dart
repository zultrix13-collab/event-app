import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:event_app/features/auth/providers/auth_provider.dart';
import 'package:event_app/features/programme/providers/programme_provider.dart';

// ---------------------------------------------------------------------------
// CheckinScreen — QR чек-ин дэлгэц
// ---------------------------------------------------------------------------

class CheckinScreen extends ConsumerWidget {
  const CheckinScreen({super.key, required this.sessionId});

  final String sessionId;

  static final _dtFmt = DateFormat('yyyy/MM/dd HH:mm');

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userId = ref.watch(currentUserProvider)?.id ?? '';
    final sessionAsync = ref.watch(sessionDetailProvider(sessionId));
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('QR Чек-ин')),
      body: sessionAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Алдаа: $e')),
        data: (session) => SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Session title + time
              Text(
                session.title,
                style: theme.textTheme.titleLarge
                    ?.copyWith(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.access_time, size: 16, color: cs.onSurfaceVariant),
                  const SizedBox(width: 4),
                  Text(
                    '${_dtFmt.format(session.startsAt)} – '
                    '${DateFormat('HH:mm').format(session.endsAt)}',
                    style: theme.textTheme.bodyMedium
                        ?.copyWith(color: cs.onSurfaceVariant),
                  ),
                ],
              ),
              if (session.venue != null) ...[
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.location_on_outlined,
                        size: 16, color: cs.onSurfaceVariant),
                    const SizedBox(width: 4),
                    Text(
                      session.venue!.name,
                      style: theme.textTheme.bodyMedium
                          ?.copyWith(color: cs.onSurfaceVariant),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 32),
              // QR code
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: cs.shadow.withOpacity(0.15),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: userId.isEmpty
                    ? const SizedBox(
                        width: 220,
                        height: 220,
                        child: Center(child: CircularProgressIndicator()),
                      )
                    : QrImageView(
                        data: userId,
                        version: QrVersions.auto,
                        size: 220,
                        backgroundColor: Colors.white,
                      ),
              ),
              const SizedBox(height: 28),
              // Instruction
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 20, vertical: 14),
                decoration: BoxDecoration(
                  color: cs.primaryContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: cs.onPrimaryContainer),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Та энэ QR кодыг ажилтанд үзүүлнэ үү',
                        style: TextStyle(
                          color: cs.onPrimaryContainer,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
