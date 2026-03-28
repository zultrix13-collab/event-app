import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/core/supabase/supabase_client.dart';
import 'package:event_app/features/organization/providers/org_provider.dart';
import 'package:event_app/shared/models/subscription.dart';

// ---------------------------------------------------------------------------
// Subscription State
// ---------------------------------------------------------------------------

class SubscriptionState {
  const SubscriptionState({
    this.isLoading = false,
    this.subscription,
    this.error,
  });

  final bool isLoading;
  final Subscription? subscription;
  final String? error;

  bool get hasSubscription => subscription != null;
  bool get isActive => subscription?.isActive ?? false;

  SubscriptionState copyWith({
    bool? isLoading,
    Subscription? subscription,
    String? error,
  }) {
    return SubscriptionState(
      isLoading: isLoading ?? this.isLoading,
      subscription: subscription ?? this.subscription,
      error: error,
    );
  }
}

// ---------------------------------------------------------------------------
// Subscription Notifier
// ---------------------------------------------------------------------------

class SubscriptionNotifier extends StateNotifier<SubscriptionState> {
  SubscriptionNotifier(this._ref) : super(const SubscriptionState());

  final Ref _ref;
  final _client = SupabaseConfig.client;

  /// Org-ийн subscription + plan fetch хийх
  Future<void> fetchSubscription() async {
    final org = _ref.read(orgProvider).organization;
    if (org == null) return;

    state = state.copyWith(isLoading: true);
    try {
      // subscriptions JOIN plans
      final data = await _client
          .from('subscriptions')
          .select('*, plans(*)')
          .eq('org_id', org.id)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle();

      if (data != null) {
        final sub = Subscription.fromJson(data);
        state = state.copyWith(isLoading: false, subscription: sub);
      } else {
        state = const SubscriptionState(isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final subscriptionProvider =
    StateNotifierProvider<SubscriptionNotifier, SubscriptionState>(
  (ref) => SubscriptionNotifier(ref),
);
