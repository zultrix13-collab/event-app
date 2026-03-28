// ---------------------------------------------------------------------------
// FloorPlan model — Давхрын зураг
// ---------------------------------------------------------------------------

class FloorPlan {
  const FloorPlan({
    required this.id,
    required this.name,
    this.nameEn,
    required this.floorNumber,
    this.svgUrl,
    this.svgContent,
    this.widthMeters,
    this.heightMeters,
  });

  final String id;
  final String name;
  final String? nameEn;
  final int floorNumber;
  final String? svgUrl;
  final String? svgContent;
  final double? widthMeters;
  final double? heightMeters;

  bool get hasSvgContent => svgContent != null && svgContent!.isNotEmpty;
  bool get hasSvgUrl => svgUrl != null && svgUrl!.isNotEmpty;

  factory FloorPlan.fromJson(Map<String, dynamic> json) {
    return FloorPlan(
      id: json['id'] as String,
      name: json['name'] as String,
      nameEn: json['name_en'] as String?,
      floorNumber: json['floor_number'] as int,
      svgUrl: json['svg_url'] as String?,
      svgContent: json['svg_content'] as String?,
      widthMeters: (json['width_meters'] as num?)?.toDouble(),
      heightMeters: (json['height_meters'] as num?)?.toDouble(),
    );
  }
}
