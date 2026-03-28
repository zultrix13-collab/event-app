// lib/features/green/providers/green_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/features/green/models/badge_model.dart';
import 'package:event_app/features/green/models/step_log.dart';
import 'package:event_app/features/green/models/user_badge.dart';
import 'package:event_app/features/green/repositories/green_repository.dart';

// ---------------------------------------------------------------------------
// Repository provider
// ---------------------------------------------------------------------------

final greenRepositoryProvider = Provider<GreenRepository>((_) => GreenRepository());

// ---------------------------------------------------------------------------
// Future providers
// ---------------------------------------------------------------------------

final todayStepsProvider = FutureProvider<StepLog?>((ref) {
  return ref.watch(greenRepositoryProvider).fetchTodaySteps();
});

final weeklyStepsProvider = FutureProvider<List<StepLog>>((ref) {
  return ref.watch(greenRepositoryProvider).fetchWeeklySteps();
});

final badgesProvider = FutureProvider<List<BadgeModel>>((ref) {
  return ref.watch(greenRepositoryProvider).fetchBadges();
});

final userBadgesProvider = FutureProvider<List<UserBadge>>((ref) {
  return ref.watch(greenRepositoryProvider).fetchUserBadges();
});

final leaderboardProvider = FutureProvider<List<Map<String, dynamic>>>((ref) {
  return ref.watch(greenRepositoryProvider).fetchLeaderboard();
});

// ---------------------------------------------------------------------------
// Step Logger Notifier
// ---------------------------------------------------------------------------

class StepLoggerNotifier extends AsyncNotifier<StepLog?> {
  @override
  Future<StepLog?> build() async {
    return ref.watch(greenRepositoryProvider).fetchTodaySteps();
  }

  Future<void> logManualSteps(int steps) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(greenRepositoryProvider);
      final log = await repo.logSteps(steps, 'manual');
      // Check and award badges after logging
      await repo.checkAndAwardBadges();
      // Invalidate related providers
      ref.invalidate(todayStepsProvider);
      ref.invalidate(weeklyStepsProvider);
      ref.invalidate(userBadgesProvider);
      ref.invalidate(leaderboardProvider);
      return log;
    });
  }
}

final stepLoggerProvider =
    AsyncNotifierProvider<StepLoggerNotifier, StepLog?>(StepLoggerNotifier.new);
