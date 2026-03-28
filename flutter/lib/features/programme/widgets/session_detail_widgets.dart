import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:event_app/features/programme/models/event_session.dart';
import 'package:event_app/features/programme/models/speaker.dart';

// ---------------------------------------------------------------------------
// Reusable widgets for SessionDetailScreen
// ---------------------------------------------------------------------------

class SessionTypeBadge extends StatelessWidget {
  const SessionTypeBadge(this.label, this.bg, this.fg, {super.key});
  final String label;
  final Color bg;
  final Color fg;

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(label, style: TextStyle(color: fg, fontSize: 12)),
      backgroundColor: bg,
      padding: const EdgeInsets.symmetric(horizontal: 4),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }
}

class SessionInfoRow extends StatelessWidget {
  const SessionInfoRow(this.icon, this.text, {super.key});
  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(children: [
        Icon(icon, size: 16, color: cs.onSurfaceVariant),
        const SizedBox(width: 6),
        Expanded(
            child: Text(text, style: Theme.of(context).textTheme.bodyMedium)),
      ]),
    );
  }
}

class CapacityBar extends StatelessWidget {
  const CapacityBar({super.key, required this.session});
  final EventSession session;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Суудлын хүрэлцээ',
                style: Theme.of(context).textTheme.labelMedium),
            Text('${session.registeredCount}/${session.capacity}'),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: session.capacityRatio.clamp(0.0, 1.0),
            minHeight: 6,
            backgroundColor: cs.surfaceVariant,
            color: session.isFull ? cs.error : cs.primary,
          ),
        ),
      ],
    );
  }
}

class RegisterButton extends StatelessWidget {
  const RegisterButton({
    super.key,
    required this.session,
    required this.loading,
    required this.onTap,
  });
  final EventSession session;
  final bool loading;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isRegistered = session.isRegistered;
    final isFull = session.isFull && !isRegistered;
    return SizedBox(
      width: double.infinity,
      child: FilledButton(
        onPressed: (loading || isFull) ? null : onTap,
        style: isRegistered
            ? FilledButton.styleFrom(
                backgroundColor:
                    Theme.of(context).colorScheme.errorContainer,
                foregroundColor:
                    Theme.of(context).colorScheme.onErrorContainer,
              )
            : null,
        child: loading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Text(isFull
                ? 'Суудал дүүрсэн'
                : isRegistered
                    ? 'Захиалга цуцлах'
                    : 'Суудал захиалах'),
      ),
    );
  }
}

class SpeakerTile extends StatelessWidget {
  const SpeakerTile({super.key, required this.speaker});
  final Speaker speaker;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: CircleAvatar(
        radius: 24,
        backgroundImage: speaker.avatarUrl != null
            ? CachedNetworkImageProvider(speaker.avatarUrl!)
            : null,
        child: speaker.avatarUrl == null ? const Icon(Icons.person) : null,
      ),
      title: Text(speaker.fullName),
      subtitle: Text(
        [speaker.title, speaker.organization].whereType<String>().join(' · '),
      ),
    );
  }
}

class SurveySection extends StatelessWidget {
  const SurveySection({
    super.key,
    required this.submitted,
    required this.rating,
    required this.controller,
    required this.onRating,
    required this.onSubmit,
  });
  final bool submitted;
  final int rating;
  final TextEditingController controller;
  final ValueChanged<int> onRating;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (submitted) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 16),
          child: Text('Үнэлгээ өгсөнд баярлалаа! 🙏'),
        ),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Үнэлгээ өгөх',
            style: theme.textTheme.titleMedium
                ?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: List.generate(
            5,
            (i) => IconButton(
              icon: Icon(i < rating ? Icons.star : Icons.star_border,
                  color: Colors.amber),
              onPressed: () => onRating(i + 1),
            ),
          ),
        ),
        TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'Сэтгэгдэл (заавал биш)',
            border: OutlineInputBorder(),
          ),
          maxLines: 3,
        ),
        const SizedBox(height: 12),
        FilledButton(
          onPressed: rating > 0 ? onSubmit : null,
          child: const Text('Илгээх'),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}
