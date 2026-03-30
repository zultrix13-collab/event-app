class Vendor {
  final String id;
  final String name;
  final String? nameEn;
  final String? description;
  final String category;
  final String? boothNumber;
  final String? phone;
  final String? website;
  final String? logoUrl;
  final bool isActive;

  const Vendor({
    required this.id,
    required this.name,
    this.nameEn,
    this.description,
    required this.category,
    this.boothNumber,
    this.phone,
    this.website,
    this.logoUrl,
    this.isActive = true,
  });

  factory Vendor.fromJson(Map<String, dynamic> json) => Vendor(
        id: json['id'] as String,
        name: json['name'] as String,
        nameEn: json['name_en'] as String?,
        description: json['description'] as String?,
        category: json['category'] as String? ?? 'general',
        boothNumber: json['booth_number'] as String?,
        phone: json['phone'] as String?,
        website: json['website'] as String?,
        logoUrl: json['logo_url'] as String?,
        isActive: json['is_active'] as bool? ?? true,
      );
}
