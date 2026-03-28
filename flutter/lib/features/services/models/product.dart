enum ProductCategory { merchandise, food, ticket, other }

ProductCategory _categoryFromString(String? s) {
  switch (s) {
    case 'merchandise':
      return ProductCategory.merchandise;
    case 'food':
      return ProductCategory.food;
    case 'ticket':
      return ProductCategory.ticket;
    default:
      return ProductCategory.other;
  }
}

class Product {
  final String id;
  final String name;
  final String nameEn;
  final String? description;
  final double price;
  final String currency;
  final String? imageUrl;
  final ProductCategory category;
  final int stockCount;
  final bool isActive;

  const Product({
    required this.id,
    required this.name,
    required this.nameEn,
    this.description,
    required this.price,
    required this.currency,
    this.imageUrl,
    required this.category,
    required this.stockCount,
    required this.isActive,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json['id'] as String,
        name: json['name'] as String,
        nameEn: json['name_en'] as String? ?? '',
        description: json['description'] as String?,
        price: (json['price'] as num).toDouble(),
        currency: json['currency'] as String? ?? 'MNT',
        imageUrl: json['image_url'] as String?,
        category: _categoryFromString(json['category'] as String?),
        stockCount: json['stock_count'] as int? ?? 0,
        isActive: json['is_active'] as bool? ?? true,
      );
}
