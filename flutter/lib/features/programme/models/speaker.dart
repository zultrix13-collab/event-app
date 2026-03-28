// ---------------------------------------------------------------------------
// Speaker model
// ---------------------------------------------------------------------------

class Speaker {
  const Speaker({
    required this.id,
    required this.fullName,
    this.fullNameEn,
    this.title,
    this.organization,
    this.avatarUrl,
    this.country,
    this.role,
  });

  final String id;
  final String fullName;
  final String? fullNameEn;
  final String? title;
  final String? organization;
  final String? avatarUrl;
  final String? country;

  /// session_speakers дэх үүрэг (жишээ: 'speaker', 'moderator')
  final String? role;

  factory Speaker.fromJson(Map<String, dynamic> json) {
    return Speaker(
      id: json['id'] as String,
      fullName: json['full_name'] as String,
      fullNameEn: json['full_name_en'] as String?,
      title: json['title'] as String?,
      organization: json['organization'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      country: json['country'] as String?,
      role: json['role'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'full_name': fullName,
        'full_name_en': fullNameEn,
        'title': title,
        'organization': organization,
        'avatar_url': avatarUrl,
        'country': country,
        'role': role,
      };
}
