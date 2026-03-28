class LostFoundItem {
  final String id;
  final String reporterId;
  final String type; // lost or found
  final String itemName;
  final String? description;
  final String? imageUrl;
  final String? lastSeenLocation;
  final String? contactInfo;
  final String status; // open, resolved
  final DateTime createdAt;

  const LostFoundItem({
    required this.id,
    required this.reporterId,
    required this.type,
    required this.itemName,
    this.description,
    this.imageUrl,
    this.lastSeenLocation,
    this.contactInfo,
    required this.status,
    required this.createdAt,
  });

  factory LostFoundItem.fromJson(Map<String, dynamic> json) => LostFoundItem(
        id: json['id'] as String,
        reporterId: json['reporter_id'] as String,
        type: json['type'] as String,
        itemName: json['item_name'] as String,
        description: json['description'] as String?,
        imageUrl: json['image_url'] as String?,
        lastSeenLocation: json['last_seen_location'] as String?,
        contactInfo: json['contact_info'] as String?,
        status: json['status'] as String? ?? 'open',
        createdAt: DateTime.parse(json['created_at'] as String),
      );
}
