// ---------------------------------------------------------------------------
// Venue model
// ---------------------------------------------------------------------------

class Venue {
  const Venue({
    required this.id,
    required this.name,
    this.nameEn,
    this.capacity,
    this.location,
    this.floor,
  });

  final String id;
  final String name;
  final String? nameEn;
  final int? capacity;
  final String? location;
  final String? floor;

  factory Venue.fromJson(Map<String, dynamic> json) {
    return Venue(
      id: json['id'] as String,
      name: json['name'] as String,
      nameEn: json['name_en'] as String?,
      capacity: json['capacity'] as int?,
      location: json['location'] as String?,
      floor: json['floor'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'name_en': nameEn,
        'capacity': capacity,
        'location': location,
        'floor': floor,
      };
}
