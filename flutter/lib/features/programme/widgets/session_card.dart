import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:event_app/features/programme/models/event_session.dart';
import 'package:intl/intl.dart';

// ---------------------------------------------------------------------------
// SessionCard — хөтөлбөрийн жагсаалтад харуулах карт
// ---------------------------------------------------------------------------

class SessionCard extends StatelessWidget {
  const SessionCard({
    super.key,
    required this.session,
    required this.onTap,
  });

  final EventSession session;
  final VoidCallback onTap;

  static final _timeFmt = DateFormat('HH:mm');

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Time + type badge row
              Row(
                children: [
                  Icon(Icons.access_time,
                      size: 14, color: cs.onSurfaceVariant),
                  const SizedBox(width: 4),
                  Text(
                    '${_timeFmt.format(session.startsAt)} – '
                    '${_timeFmt.format(session.endsAt)}',
                    style: theme.textTheme.bodySmall
                        ?.copyWith(color: cs.onSurfaceVariant),
                  ),
                  const Spacer(),
                  if (session.sessionType != null)
                    _TypeBadge(type: session.sessionType!),
                ],
              ),
              const SizedBox(height: 8),
              // Title
              Text(
                session.title,
                style: theme.textTheme.titleSmall
                    ?.copyWith(fontWeight: FontWeight.w600),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              // Venue
              if (session.venue != null) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.location_on_outlined,
                        size: 13, color: cs.onSurfaceVariant),
                    const SizedBox(width: 2),
                    Expanded(
                      child: Text(
                        session.venue!.name,
                        style: theme.textTheme.bodySmall
                            ?.copyWith(color: cs.onSurfaceVariant),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 10),
              // Speaker avatars + capacity bar
              Row(
                children: [
                  _SpeakerAvatars(speakers: session.speakers
                      .map((s) => s.avatarUrl)
                      .whereType<String>()
                      .take(4)
                      .toList()),
                  const Spacer(),
                  if (session.capacity != null)
                    _CapacityChip(session: session),
                ],
              ),
              if (session.capacity != null) ...[
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: session.capacityRatio.clamp(0.0, 1.0),
                    minHeight: 4,
                    backgroundColor: cs.surfaceVariant,
                    color: session.isFull ? cs.error : cs.primary,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _TypeBadge extends StatelessWidget {
  const _TypeBadge({required this.type});
  final String type;

  static const _labels = {
    'keynote': 'Үндсэн',
    'workshop': 'Воркшоп',
    'panel': 'Панел',
    'breakout': 'Брэйкаут',
    'networking': 'Нетворкинг',
  };

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: cs.primaryContainer,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        _labels[type] ?? type,
        style: TextStyle(fontSize: 11, color: cs.onPrimaryContainer),
      ),
    );
  }
}

class _SpeakerAvatars extends StatelessWidget {
  const _SpeakerAvatars({required this.speakers});
  final List<String> speakers;

  @override
  Widget build(BuildContext context) {
    if (speakers.isEmpty) return const SizedBox.shrink();
    return SizedBox(
      height: 28,
      child: Row(
        children: List.generate(
          speakers.length.clamp(0, 4),
          (i) => Padding(
            padding: EdgeInsets.only(right: i < speakers.length - 1 ? 4 : 0),
            child: CircleAvatar(
              radius: 14,
              backgroundImage:
                  CachedNetworkImageProvider(speakers[i]),
            ),
          ),
        ),
      ),
    );
  }
}

class _CapacityChip extends StatelessWidget {
  const _CapacityChip({required this.session});
  final EventSession session;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isFull = session.isFull;
    return Text(
      isFull
          ? 'Дүүрсэн'
          : '${session.registeredCount}/${session.capacity}',
      style: TextStyle(
        fontSize: 12,
        color: isFull ? cs.error : cs.onSurfaceVariant,
        fontWeight: FontWeight.w500,
      ),
    );
  }
}
