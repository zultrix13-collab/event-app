// lib/features/green/models/badge_model.dart
// Named BadgeModel to avoid conflict with Flutter's Badge widget

class BadgeModel {
  const BadgeModel({
    required this.id,
    required this.name,
    required this.nameEn,
    required this.description,
    required this.descriptionEn,
    required this.icon,
    required this.requirementSteps,
    required this.badgeType,
    required this.createdAt,
  });

  final String id;
  final String name;
  final String nameEn;
  final String description;
  final String descriptionEn;
  final String icon;
  final int requirementSteps;
  final String badgeType;
  final DateTime createdAt;

  factory BadgeModel.fromJson(Map<String, dynamic> json) {
    return BadgeModel(
      id: json['id'] as String,
      name: json['name'] as String,
      nameEn: json['name_en'] as String? ?? json['name'] as String,
      description: json['description'] as String? ?? '',
      descriptionEn: json['description_en'] as String? ?? '',
      icon: json['icon'] as String? ?? '🏅',
      requirementSteps: json['requirement_steps'] as int? ?? 0,
      badgeType: json['badge_type'] as String? ?? 'steps',
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
