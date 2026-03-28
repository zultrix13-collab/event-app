import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/features/programme/models/event_session.dart';
import 'package:event_app/features/programme/repositories/programme_repository.dart';

// ---------------------------------------------------------------------------
// Repository provider
// ---------------------------------------------------------------------------

final programmeRepositoryProvider = Provider<ProgrammeRepository>(
  (_) => ProgrammeRepository(),
);

// ---------------------------------------------------------------------------
// Sessions — all published sessions
// ---------------------------------------------------------------------------

class SessionsNotifier extends AsyncNotifier<List<EventSession>> {
  @override
  Future<List<EventSession>> build() async {
    return ref.read(programmeRepositoryProvider).fetchSessions();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(programmeRepositoryProvider).fetchSessions(),
    );
  }

  /// Agenda toggle — optimistic update
  Future<void> toggleAgenda(String sessionId) async {
    final repo = ref.read(programmeRepositoryProvider);
    await repo.toggleAgenda(sessionId);
    await refresh();
  }

  /// Register for a seat — optimistic update
  Future<void> registerSeat(String sessionId) async {
    final repo = ref.read(programmeRepositoryProvider);
    await repo.registerSeat(sessionId);
    await refresh();
  }

  /// Cancel registration
  Future<void> cancelRegistration(String sessionId) async {
    final repo = ref.read(programmeRepositoryProvider);
    await repo.cancelRegistration(sessionId);
    await refresh();
  }
}

final sessionsProvider =
    AsyncNotifierProvider<SessionsNotifier, List<EventSession>>(
  SessionsNotifier.new,
);

// ---------------------------------------------------------------------------
// Single session detail
// ---------------------------------------------------------------------------

final sessionDetailProvider =
    FutureProvider.family<EventSession, String>((ref, id) async {
  return ref.read(programmeRepositoryProvider).fetchSessionDetail(id);
});

// ---------------------------------------------------------------------------
// My agenda (bookmarked sessions)
// ---------------------------------------------------------------------------

final myAgendaProvider = FutureProvider<List<EventSession>>((ref) async {
  return ref.read(programmeRepositoryProvider).fetchMyAgenda();
});

// ---------------------------------------------------------------------------
// My registrations
// ---------------------------------------------------------------------------

final myRegistrationsProvider = FutureProvider<List<EventSession>>((ref) async {
  return ref.read(programmeRepositoryProvider).fetchMyRegistrations();
});
