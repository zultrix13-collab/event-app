import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:event_app/features/map/models/floor_plan.dart';
import 'package:event_app/features/map/models/indoor_zone.dart';
import 'package:event_app/features/map/models/map_poi.dart';

// ---------------------------------------------------------------------------
// MapRepository — Газрын зураг мэдээлэл
// ---------------------------------------------------------------------------

class MapRepository {
  MapRepository(this._client);

  final SupabaseClient _client;

  /// Идэвхтэй газрын цэгүүдийг татах
  Future<List<MapPOI>> fetchPOIs() async {
    final data = await _client
        .from('map_pois')
        .select()
        .eq('is_active', true)
        .order('name');
    return (data as List).map((e) => MapPOI.fromJson(e)).toList();
  }

  /// Идэвхтэй давхрын зургуудыг татах
  Future<List<FloorPlan>> fetchFloorPlans() async {
    final data = await _client
        .from('floor_plans')
        .select()
        .eq('is_active', true)
        .order('floor_number');
    return (data as List).map((e) => FloorPlan.fromJson(e)).toList();
  }

  /// Тухайн давхрын бүсүүдийг татах
  Future<List<IndoorZone>> fetchZones(String floorPlanId) async {
    final data = await _client
        .from('indoor_zones')
        .select()
        .eq('floor_plan_id', floorPlanId)
        .order('name');
    return (data as List).map((e) => IndoorZone.fromJson(e)).toList();
  }

  /// QR checkpoint-ийг шалгаж, attendance бүртгэх
  Future<bool> recordQrCheckin(String qrCode, String? sessionId) async {
    // QR checkpoint байгаа эсэхийг шалгах
    final checkpoints = await _client
        .from('qr_checkpoints')
        .select('id, zone_id')
        .eq('qr_code', qrCode)
        .limit(1);

    if ((checkpoints as List).isEmpty) return false;

    final userId = _client.auth.currentUser?.id;

    await _client.from('attendance').insert({
      'session_id': sessionId,
      'user_id': userId,
      'check_in_method': 'qr',
      'checked_in_at': DateTime.now().toIso8601String(),
    });

    return true;
  }
}
