import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:event_app/features/programme/models/event_session.dart';
import 'package:event_app/features/programme/providers/programme_provider.dart';
import 'package:event_app/features/programme/widgets/session_detail_widgets.dart';

// ---------------------------------------------------------------------------
// SessionDetailScreen
// ---------------------------------------------------------------------------

class SessionDetailScreen extends ConsumerWidget {
  const SessionDetailScreen({super.key, required this.sessionId});

  final String sessionId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionAsync = ref.watch(sessionDetailProvider(sessionId));

    return sessionAsync.when(
      loading: () =>
          const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('Алдаа гарлаа: $e')),
      ),
      data: (session) => _DetailScaffold(session: session),
    );
  }
}

// ---------------------------------------------------------------------------
// Stateful detail body (handles actions + survey state)
// ---------------------------------------------------------------------------

class _DetailScaffold extends ConsumerStatefulWidget {
  const _DetailScaffold({required this.session});
  final EventSession session;

  @override
  ConsumerState<_DetailScaffold> createState() => _DetailScaffoldState();
}

class _DetailScaffoldState extends ConsumerState<_DetailScaffold> {
  static final _dtFmt = DateFormat('yyyy/MM/dd HH:mm');
  static final _timeFmt = DateFormat('HH:mm');

  int _surveyRating = 0;
  final _feedbackCtrl = TextEditingController();
  bool _surveySubmitted = false;
  bool _actionLoading = false;

  @override
  void dispose() {
    _feedbackCtrl.dispose();
    super.dispose();
  }

  Future<void> _toggleRegistration() async {
    setState(() => _actionLoading = true);
    try {
      final notifier = ref.read(sessionsProvider.notifier);
      if (widget.session.isRegistered) {
        await notifier.cancelRegistration(widget.session.id);
      } else {
        await notifier.registerSeat(widget.session.id);
      }
      ref.invalidate(sessionDetailProvider(widget.session.id));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Алдаа: $e')));
      }
    } finally {
      if (mounted) setState(() => _actionLoading = false);
    }
  }

  Future<void> _toggleAgenda() async {
    try {
      await ref.read(sessionsProvider.notifier).toggleAgenda(widget.session.id);
      ref.invalidate(sessionDetailProvider(widget.session.id));
      ref.invalidate(myAgendaProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Алдаа: $e')));
      }
    }
  }

  Future<void> _submitSurvey() async {
    if (_surveyRating == 0) return;
    await ref.read(programmeRepositoryProvider).submitSurvey(
          widget.session.id,
          rating: _surveyRating,
          feedback: _feedbackCtrl.text.trim().isEmpty
              ? null
              : _feedbackCtrl.text.trim(),
        );
    if (mounted) setState(() => _surveySubmitted = true);
  }

  @override
  Widget build(BuildContext context) {
    final session = widget.session;
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            title: Text(session.title,
                maxLines: 1, overflow: TextOverflow.ellipsis),
            actions: [
              IconButton(
                icon: Icon(
                  session.isInAgenda ? Icons.favorite : Icons.favorite_border,
                  color: session.isInAgenda ? cs.error : null,
                ),
                tooltip: 'Хөтөлбөрт нэмэх',
                onPressed: _toggleAgenda,
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Type + zone badges
                  Wrap(spacing: 8, children: [
                    if (session.sessionType != null)
                      SessionTypeBadge(session.sessionType!,
                          cs.primaryContainer, cs.onPrimaryContainer),
                    if (session.zone != null)
                      SessionTypeBadge(session.zone!, cs.secondaryContainer,
                          cs.onSecondaryContainer),
                  ]),
                  const SizedBox(height: 12),
                  Text(session.title,
                      style: theme.textTheme.headlineSmall
                          ?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  SessionInfoRow(Icons.access_time,
                      '${_dtFmt.format(session.startsAt)} – ${_timeFmt.format(session.endsAt)}'),
                  if (session.venue != null)
                    SessionInfoRow(
                        Icons.location_on_outlined, session.venue!.name),
                  const SizedBox(height: 8),
                  if (session.description != null) ...[
                    Text(session.description!,
                        style: theme.textTheme.bodyMedium),
                    const SizedBox(height: 16),
                  ],
                  if (session.capacity != null) ...[
                    CapacityBar(session: session),
                    const SizedBox(height: 16),
                  ],
                  if (session.isRegistrationOpen) ...[
                    RegisterButton(
                      session: session,
                      loading: _actionLoading,
                      onTap: _toggleRegistration,
                    ),
                    const SizedBox(height: 8),
                  ],
                  if (session.isRegistered)
                    OutlinedButton.icon(
                      onPressed: () =>
                          context.push('/programme/checkin/${session.id}'),
                      icon: const Icon(Icons.qr_code),
                      label: const Text('QR чек-ин'),
                    ),
                  const Divider(height: 32),
                  if (session.speakers.isNotEmpty) ...[
                    Text('Илтгэгчид',
                        style: theme.textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    ...session.speakers.map((s) => SpeakerTile(speaker: s)),
                    const Divider(height: 32),
                  ],
                  if (session.isEnded)
                    SurveySection(
                      submitted: _surveySubmitted,
                      rating: _surveyRating,
                      controller: _feedbackCtrl,
                      onRating: (r) => setState(() => _surveyRating = r),
                      onSubmit: _submitSurvey,
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
