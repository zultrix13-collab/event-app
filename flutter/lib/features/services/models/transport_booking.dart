class TransportBooking {
  final String id;
  final String userId;
  final String type; // taxi, rental, shuttle, airport
  final String pickupLocation;
  final String dropoffLocation;
  final DateTime pickupTime;
  final int passengerCount;
  final String status;
  final String? notes;

  const TransportBooking({
    required this.id,
    required this.userId,
    required this.type,
    required this.pickupLocation,
    required this.dropoffLocation,
    required this.pickupTime,
    required this.passengerCount,
    required this.status,
    this.notes,
  });

  factory TransportBooking.fromJson(Map<String, dynamic> json) =>
      TransportBooking(
        id: json['id'] as String,
        userId: json['user_id'] as String,
        type: json['type'] as String,
        pickupLocation: json['pickup_location'] as String,
        dropoffLocation: json['dropoff_location'] as String,
        pickupTime: DateTime.parse(json['pickup_time'] as String),
        passengerCount: json['passenger_count'] as int? ?? 1,
        status: json['status'] as String? ?? 'pending',
        notes: json['notes'] as String?,
      );
}
