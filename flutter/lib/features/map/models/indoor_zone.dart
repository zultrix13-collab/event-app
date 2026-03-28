// ---------------------------------------------------------------------------
// IndoorZone model — Дотоод бүс
// ---------------------------------------------------------------------------

class IndoorZone {
  const IndoorZone({
    required this.id,
    required this.floorPlanId,
    required this.name,
    this.nameEn,
    this.zoneType,
    required this.xPercent,
    required this.yPercent,
    this.widthPercent,
    this.heightPercent,
    this.color,
    this.qrCode,
  });

  final String id;
  final String floorPlanId;
  final String name;
  final String? nameEn;
  final String? zoneType;
  final double xPercent;
  final double yPercent;
  final double? widthPercent;
  final double? heightPercent;
  final String? color;
  final String? qrCode;

  factory IndoorZone.fromJson(Map<String, dynamic> json) {
    return IndoorZone(
      id: json['id'] as String,
      floorPlanId: json['floor_plan_id'] as String,
      name: json['name'] as String,
      nameEn: json['name_en'] as String?,
      zoneType: json['zone_type'] as String?,
      xPercent: (json['x_percent'] as num).toDouble(),
      yPercent: (json['y_percent'] as num).toDouble(),
      widthPercent: (json['width_percent'] as num?)?.toDouble(),
      heightPercent: (json['height_percent'] as num?)?.toDouble(),
      color: json['color'] as String?,
      qrCode: json['qr_code'] as String?,
    );
  }
}
