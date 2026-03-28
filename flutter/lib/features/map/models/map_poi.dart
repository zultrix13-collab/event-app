// ---------------------------------------------------------------------------
// MapPOI model — Газрын цэг
// ---------------------------------------------------------------------------

enum PoiCategory { venue, hotel, restaurant, transport, medical, other }

PoiCategory _parseCategory(String? value) {
  switch (value) {
    case 'venue':
      return PoiCategory.venue;
    case 'hotel':
      return PoiCategory.hotel;
    case 'restaurant':
      return PoiCategory.restaurant;
    case 'transport':
      return PoiCategory.transport;
    case 'medical':
      return PoiCategory.medical;
    default:
      return PoiCategory.other;
  }
}

class MapPOI {
  const MapPOI({
    required this.id,
    required this.name,
    this.nameEn,
    this.description,
    this.descriptionEn,
    required this.category,
    required this.latitude,
    required this.longitude,
    this.address,
    this.imageUrl,
  });

  final String id;
  final String name;
  final String? nameEn;
  final String? description;
  final String? descriptionEn;
  final PoiCategory category;
  final double latitude;
  final double longitude;
  final String? address;
  final String? imageUrl;

  factory MapPOI.fromJson(Map<String, dynamic> json) {
    return MapPOI(
      id: json['id'] as String,
      name: json['name'] as String,
      nameEn: json['name_en'] as String?,
      description: json['description'] as String?,
      descriptionEn: json['description_en'] as String?,
      category: _parseCategory(json['category'] as String?),
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      address: json['address'] as String?,
      imageUrl: json['image_url'] as String?,
    );
  }
}
