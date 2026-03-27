import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:saas_base/core/supabase/supabase_client.dart';
import 'package:saas_base/features/auth/providers/auth_provider.dart';
import 'package:saas_base/shared/models/organization.dart';

// ---------------------------------------------------------------------------
// Org State
// ---------------------------------------------------------------------------

class OrgState {
  const OrgState({
    this.isLoading = false,
    this.organization,
    this.error,
  });

  final bool isLoading;
  final Organization? organization;
  final String? error;

  bool get hasOrg => organization != null;

  OrgState copyWith({
    bool? isLoading,
    Organization? organization,
    String? error,
    bool clearOrg = false,
  }) {
    return OrgState(
      isLoading: isLoading ?? this.isLoading,
      organization: clearOrg ? null : (organization ?? this.organization),
      error: error,
    );
  }
}

// ---------------------------------------------------------------------------
// Org Notifier
// ---------------------------------------------------------------------------

class OrgNotifier extends StateNotifier<OrgState> {
  OrgNotifier(this._ref) : super(const OrgState());

  final Ref _ref;
  final _client = SupabaseConfig.client;

  /// Current user-ийн org fetch хийх
  Future<void> fetchOrg() async {
    final user = _ref.read(currentUserProvider);
    if (user == null) return;

    state = state.copyWith(isLoading: true);
    try {
      // organizations JOIN organization_members
      final data = await _client
          .from('organization_members')
          .select('organizations(*)')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

      if (data != null && data['organizations'] != null) {
        final org = Organization.fromJson(
          data['organizations'] as Map<String, dynamic>,
        );
        state = state.copyWith(isLoading: false, organization: org);
      } else {
        state = state.copyWith(isLoading: false, clearOrg: true);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Шинэ org үүсгэх
  Future<void> createOrg({required String name, required String slug}) async {
    final user = _ref.read(currentUserProvider);
    if (user == null) return;

    state = state.copyWith(isLoading: true);
    try {
      // Org үүсгэх
      final orgData = await _client
          .from('organizations')
          .insert({'name': name, 'slug': slug})
          .select()
          .single();

      final org = Organization.fromJson(orgData);

      // Member нэм
      await _client.from('organization_members').insert({
        'org_id': org.id,
        'user_id': user.id,
        'role': 'owner',
      });

      state = state.copyWith(isLoading: false, organization: org);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final orgProvider = StateNotifierProvider<OrgNotifier, OrgState>(
  (ref) => OrgNotifier(ref),
);
