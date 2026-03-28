// lib/features/green/models/user_badge.dart

class UserBadge {
  const UserBadge({
    required this.id,
    required this.userId,
    required this.badgeId,
    required this.earnedAt,
  });

  final String id;
  final String userId;
  final String badgeId;
  final DateTime earnedAt;

  factory UserBadge.fromJson(Map<String, dynamic> json) {
    return UserBadge(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      badgeId: json['badge_id'] as String,
      earnedAt: DateTime.parse(json['earned_at'] as String),
    );
  }
}
