import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:event_app/features/map/models/floor_plan.dart';
import 'package:event_app/features/map/models/indoor_zone.dart';
import 'package:event_app/features/map/models/map_poi.dart';
import 'package:event_app/features/map/repositories/map_repository.dart';

// ---------------------------------------------------------------------------
// Repository Provider
// ---------------------------------------------------------------------------

final mapRepositoryProvider = Provider<MapRepository>((ref) {
  return MapRepository(Supabase.instance.client);
});

// ---------------------------------------------------------------------------
// POIs Provider — category filter дэмжсэн AsyncNotifier
// ---------------------------------------------------------------------------

class PoisNotifier extends AsyncNotifier<List<MapPOI>> {
  PoiCategory? _categoryFilter;

  @override
  Future<List<MapPOI>> build() async {
    final repo = ref.read(mapRepositoryProvider);
    final all = await repo.fetchPOIs();
    if (_categoryFilter == null) return all;
    return all.where((p) => p.category == _categoryFilter).toList();
  }

  void filterByCategory(PoiCategory? category) {
    _categoryFilter = category;
    ref.invalidateSelf();
  }

  PoiCategory? get activeFilter => _categoryFilter;
}

final poisProvider = AsyncNotifierProvider<PoisNotifier, List<MapPOI>>(
  PoisNotifier.new,
);

// ---------------------------------------------------------------------------
// Floor Plans Provider
// ---------------------------------------------------------------------------

final floorPlansProvider = FutureProvider<List<FloorPlan>>((ref) async {
  final repo = ref.read(mapRepositoryProvider);
  return repo.fetchFloorPlans();
});

// ---------------------------------------------------------------------------
// Zones Provider (per floor plan)
// ---------------------------------------------------------------------------

final zonesProvider =
    FutureProvider.family<List<IndoorZone>, String>((ref, floorPlanId) async {
  final repo = ref.read(mapRepositoryProvider);
  return repo.fetchZones(floorPlanId);
});
