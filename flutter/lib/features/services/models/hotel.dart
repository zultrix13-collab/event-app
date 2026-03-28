class Hotel {
  final String id;
  final String name;
  final String nameEn;
  final String? description;
  final String? address;
  final int? stars;
  final String? imageUrl;
  final String? bookingUrl;
  final String? phone;
  final double? distanceKm;
  final bool isActive;

  const Hotel({
    required this.id,
    required this.name,
    required this.nameEn,
    this.description,
    this.address,
    this.stars,
    this.imageUrl,
    this.bookingUrl,
    this.phone,
    this.distanceKm,
    required this.isActive,
  });

  factory Hotel.fromJson(Map<String, dynamic> json) => Hotel(
        id: json['id'] as String,
        name: json['name'] as String,
        nameEn: json['name_en'] as String? ?? '',
        description: json['description'] as String?,
        address: json['address'] as String?,
        stars: json['stars'] as int?,
        imageUrl: json['image_url'] as String?,
        bookingUrl: json['booking_url'] as String?,
        phone: json['phone'] as String?,
        distanceKm: json['distance_km'] != null
            ? (json['distance_km'] as num).toDouble()
            : null,
        isActive: json['is_active'] as bool? ?? true,
      );
}
