import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/features/programme/models/event_session.dart';
import 'package:event_app/features/programme/providers/programme_provider.dart';
import 'package:event_app/features/programme/widgets/session_card.dart';
import 'package:event_app/features/programme/widgets/session_filters.dart';

// ---------------------------------------------------------------------------
// ProgrammeScreen — Хөтөлбөр жагсаалт
// ---------------------------------------------------------------------------

class ProgrammeScreen extends ConsumerStatefulWidget {
  const ProgrammeScreen({super.key});

  @override
  ConsumerState<ProgrammeScreen> createState() => _ProgrammeScreenState();
}

class _ProgrammeScreenState extends ConsumerState<ProgrammeScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  String? _selectedType;
  DateTime? _selectedDay;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final sessionsAsync = ref.watch(sessionsProvider);
    final agendaAsync = ref.watch(myAgendaProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Хөтөлбөр'),
        bottom: TabBar(
          controller: _tabs,
          tabs: const [Tab(text: 'Бүгд'), Tab(text: 'Миний хөтөлбөр')],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: [
          // ---- All sessions tab ----
          sessionsAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => _ErrorView(
              message: e.toString(),
              onRetry: () => ref.invalidate(sessionsProvider),
            ),
            data: (sessions) => SessionFilterList(
              sessions: sessions,
              selectedType: _selectedType,
              selectedDay: _selectedDay,
              onTypeSelected: (t) => setState(() => _selectedType = t),
              onDaySelected: (d) => setState(() => _selectedDay = d),
              onSessionTap: (s) => context.push('/programme/${s.id}'),
            ),
          ),
          // ---- My agenda tab ----
          agendaAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => _ErrorView(
              message: e.toString(),
              onRetry: () => ref.invalidate(myAgendaProvider),
            ),
            data: (sessions) => sessions.isEmpty
                ? const _EmptyAgenda()
                : _AgendaList(sessions: sessions),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Agenda list (simple, no filters)
// ---------------------------------------------------------------------------

class _AgendaList extends StatelessWidget {
  const _AgendaList({required this.sessions});
  final List<EventSession> sessions;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: sessions.length,
      itemBuilder: (ctx, i) => SessionCard(
        session: sessions[i],
        onTap: () => context.push('/programme/${sessions[i].id}'),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Helper widgets
// ---------------------------------------------------------------------------

class _EmptyAgenda extends StatelessWidget {
  const _EmptyAgenda();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.bookmark_border, size: 56),
          SizedBox(height: 12),
          Text('Хөтөлбөрт нэмсэн илтгэл байхгүй байна'),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline, size: 48),
          const SizedBox(height: 8),
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 12),
          FilledButton(onPressed: onRetry, child: const Text('Дахин оролдох')),
        ],
      ),
    );
  }
}
