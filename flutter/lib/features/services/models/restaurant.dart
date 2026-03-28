class Restaurant {
  final String id;
  final String name;
  final String nameEn;
  final String? description;
  final String? cuisineType;
  final String? location;
  final String? openingHours;
  final String? imageUrl;
  final bool isActive;

  const Restaurant({
    required this.id,
    required this.name,
    required this.nameEn,
    this.description,
    this.cuisineType,
    this.location,
    this.openingHours,
    this.imageUrl,
    required this.isActive,
  });

  factory Restaurant.fromJson(Map<String, dynamic> json) => Restaurant(
        id: json['id'] as String,
        name: json['name'] as String,
        nameEn: json['name_en'] as String? ?? '',
        description: json['description'] as String?,
        cuisineType: json['cuisine_type'] as String?,
        location: json['location'] as String?,
        openingHours: json['opening_hours'] as String?,
        imageUrl: json['image_url'] as String?,
        isActive: json['is_active'] as bool? ?? true,
      );
}

class RestaurantBooking {
  final String id;
  final String userId;
  final String restaurantName;
  final DateTime bookingTime;
  final int partySize;
  final String status;
  final String? specialRequests;

  const RestaurantBooking({
    required this.id,
    required this.userId,
    required this.restaurantName,
    required this.bookingTime,
    required this.partySize,
    required this.status,
    this.specialRequests,
  });

  factory RestaurantBooking.fromJson(Map<String, dynamic> json) =>
      RestaurantBooking(
        id: json['id'] as String,
        userId: json['user_id'] as String,
        restaurantName: json['restaurant_name'] as String,
        bookingTime: DateTime.parse(json['booking_time'] as String),
        partySize: json['party_size'] as int? ?? 1,
        status: json['status'] as String? ?? 'pending',
        specialRequests: json['special_requests'] as String?,
      );
}
