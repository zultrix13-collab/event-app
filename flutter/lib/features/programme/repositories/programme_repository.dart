import 'package:event_app/core/supabase/supabase_client.dart';
import 'package:event_app/features/programme/models/event_session.dart';

// ---------------------------------------------------------------------------
// ProgrammeRepository — Supabase data access
// ---------------------------------------------------------------------------

class ProgrammeRepository {
  ProgrammeRepository();

  final _client = SupabaseConfig.client;

  String get _userId => _client.auth.currentUser!.id;

  // -------------------------------------------------------------------------
  // Sessions
  // -------------------------------------------------------------------------

  Future<List<EventSession>> fetchSessions() async {
    final data = await _client
        .from('event_sessions')
        .select('''
          *,
          venues(*),
          session_speakers(role, sort_order, speakers(*))
        ''')
        .eq('is_published', true)
        .order('starts_at');

    final agendaSet = await _fetchAgendaIds();
    final regSet = await _fetchRegistrationIds();

    return (data as List<dynamic>).map((e) {
      final session = EventSession.fromJson(e as Map<String, dynamic>);
      return session.copyWith(
        isInAgenda: agendaSet.contains(session.id),
        isRegistered: regSet.contains(session.id),
      );
    }).toList();
  }

  Future<EventSession> fetchSessionDetail(String id) async {
    final data = await _client
        .from('event_sessions')
        .select('''
          *,
          venues(*),
          session_speakers(role, sort_order, speakers(*))
        ''')
        .eq('id', id)
        .single();

    final agendaSet = await _fetchAgendaIds();
    final regSet = await _fetchRegistrationIds();

    final session = EventSession.fromJson(data as Map<String, dynamic>);
    return session.copyWith(
      isInAgenda: agendaSet.contains(session.id),
      isRegistered: regSet.contains(session.id),
    );
  }

  // -------------------------------------------------------------------------
  // Seat registration
  // -------------------------------------------------------------------------

  Future<void> registerSeat(String sessionId) async {
    await _client.from('seat_registrations').insert({
      'session_id': sessionId,
      'user_id': _userId,
      'status': 'registered',
    });
  }

  Future<void> cancelRegistration(String sessionId) async {
    await _client
        .from('seat_registrations')
        .update({'status': 'cancelled'})
        .eq('session_id', sessionId)
        .eq('user_id', _userId);
  }

  // -------------------------------------------------------------------------
  // Agenda (bookmark)
  // -------------------------------------------------------------------------

  Future<void> toggleAgenda(String sessionId) async {
    final existing = await _client
        .from('user_agenda')
        .select('session_id')
        .eq('session_id', sessionId)
        .eq('user_id', _userId)
        .maybeSingle();

    if (existing != null) {
      await _client
          .from('user_agenda')
          .delete()
          .eq('session_id', sessionId)
          .eq('user_id', _userId);
    } else {
      await _client.from('user_agenda').insert({
        'session_id': sessionId,
        'user_id': _userId,
      });
    }
  }

  // -------------------------------------------------------------------------
  // Survey
  // -------------------------------------------------------------------------

  Future<void> submitSurvey(
    String sessionId, {
    required int rating,
    String? feedback,
  }) async {
    await _client.from('session_surveys').upsert({
      'session_id': sessionId,
      'user_id': _userId,
      'rating': rating,
      'feedback': feedback,
    });
  }

  // -------------------------------------------------------------------------
  // My registrations & agenda
  // -------------------------------------------------------------------------

  Future<List<EventSession>> fetchMyRegistrations() async {
    final data = await _client
        .from('seat_registrations')
        .select('''
          session_id,
          event_sessions!inner(
            *,
            venues(*),
            session_speakers(role, sort_order, speakers(*))
          )
        ''')
        .eq('user_id', _userId)
        .eq('status', 'registered');

    return (data as List<dynamic>).map((e) {
      final map = e as Map<String, dynamic>;
      final sessionMap = map['event_sessions'] as Map<String, dynamic>;
      return EventSession.fromJson(sessionMap).copyWith(isRegistered: true);
    }).toList();
  }

  Future<List<EventSession>> fetchMyAgenda() async {
    final data = await _client
        .from('user_agenda')
        .select('''
          session_id,
          event_sessions!inner(
            *,
            venues(*),
            session_speakers(role, sort_order, speakers(*))
          )
        ''')
        .eq('user_id', _userId)
        .order('added_at');

    final regSet = await _fetchRegistrationIds();

    return (data as List<dynamic>).map((e) {
      final map = e as Map<String, dynamic>;
      final sessionMap = map['event_sessions'] as Map<String, dynamic>;
      final session = EventSession.fromJson(sessionMap);
      return session.copyWith(
        isInAgenda: true,
        isRegistered: regSet.contains(session.id),
      );
    }).toList();
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  Future<Set<String>> _fetchAgendaIds() async {
    final data = await _client
        .from('user_agenda')
        .select('session_id')
        .eq('user_id', _userId);
    return (data as List<dynamic>)
        .map((e) => (e as Map<String, dynamic>)['session_id'] as String)
        .toSet();
  }

  Future<Set<String>> _fetchRegistrationIds() async {
    final data = await _client
        .from('seat_registrations')
        .select('session_id')
        .eq('user_id', _userId)
        .eq('status', 'registered');
    return (data as List<dynamic>)
        .map((e) => (e as Map<String, dynamic>)['session_id'] as String)
        .toSet();
  }
}
