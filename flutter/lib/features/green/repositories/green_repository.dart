// lib/features/green/repositories/green_repository.dart

import 'package:event_app/core/supabase/supabase_client.dart';
import 'package:event_app/features/green/models/badge_model.dart';
import 'package:event_app/features/green/models/step_log.dart';
import 'package:event_app/features/green/models/user_badge.dart';

class GreenRepository {
  final _client = SupabaseConfig.client;

  String get _userId => _client.auth.currentUser!.id;

  String get _today => DateTime.now().toIso8601String().split('T').first;

  // ---------------------------------------------------------------------------
  // Step Logs
  // ---------------------------------------------------------------------------

  Future<StepLog?> fetchTodaySteps() async {
    final data = await _client
        .from('step_logs')
        .select()
        .eq('user_id', _userId)
        .eq('date', _today)
        .maybeSingle();
    return data != null ? StepLog.fromJson(data) : null;
  }

  Future<StepLog> logSteps(int steps, String source) async {
    // Calculate CO2: ~0.21g CO2 per step (walking vs driving equivalent)
    final co2Grams = (steps * 0.21).round();

    final data = await _client.from('step_logs').upsert(
      {
        'user_id': _userId,
        'steps': steps,
        'date': _today,
        'co2_saved_grams': co2Grams,
        'source': source,
      },
      onConflict: 'user_id,date',
    ).select().single();

    return StepLog.fromJson(data);
  }

  Future<List<StepLog>> fetchWeeklySteps() async {
    final sevenDaysAgo = DateTime.now().subtract(const Duration(days: 6));
    final fromDate = sevenDaysAgo.toIso8601String().split('T').first;

    final data = await _client
        .from('step_logs')
        .select()
        .eq('user_id', _userId)
        .gte('date', fromDate)
        .order('date', ascending: true);

    return (data as List).map((e) => StepLog.fromJson(e)).toList();
  }

  // ---------------------------------------------------------------------------
  // Badges
  // ---------------------------------------------------------------------------

  Future<List<BadgeModel>> fetchBadges() async {
    final data = await _client
        .from('badges')
        .select()
        .order('requirement_steps', ascending: true);
    return (data as List).map((e) => BadgeModel.fromJson(e)).toList();
  }

  Future<List<UserBadge>> fetchUserBadges() async {
    final data = await _client
        .from('user_badges')
        .select()
        .eq('user_id', _userId);
    return (data as List).map((e) => UserBadge.fromJson(e)).toList();
  }

  // ---------------------------------------------------------------------------
  // Leaderboard
  // ---------------------------------------------------------------------------

  /// Calls the Supabase RPC function `get_step_leaderboard(limit_count int DEFAULT 20)`.
  /// Returns TABLE(user_id uuid, full_name text, avatar_url text,
  ///               total_steps bigint, total_co2_saved_grams numeric, rank bigint)
  /// Defined in migration: 20260327007_green_leaderboard.sql
  Future<List<Map<String, dynamic>>> fetchLeaderboard({int limit = 20}) async {
    final data = await _client
        .rpc('get_step_leaderboard', params: {'limit_count': limit});
    return (data as List).cast<Map<String, dynamic>>();
  }

  // ---------------------------------------------------------------------------
  // Badge Awarding
  // ---------------------------------------------------------------------------

  Future<void> checkAndAwardBadges() async {
    // Get total steps for user
    final stepData = await _client
        .from('step_logs')
        .select('steps')
        .eq('user_id', _userId);

    final totalSteps = (stepData as List)
        .fold<int>(0, (sum, row) => sum + (row['steps'] as int));

    // Fetch all badges and already-earned badges
    final allBadges = await fetchBadges();
    final earned = await fetchUserBadges();
    final earnedIds = earned.map((e) => e.badgeId).toSet();

    // Find newly eligible badges
    final newBadges = allBadges.where((b) =>
        b.requirementSteps <= totalSteps && !earnedIds.contains(b.id));

    for (final badge in newBadges) {
      await _client.from('user_badges').insert({
        'user_id': _userId,
        'badge_id': badge.id,
        'earned_at': DateTime.now().toIso8601String(),
      });
    }
  }
}
