import 'package:event_app/features/programme/models/speaker.dart';
import 'package:event_app/features/programme/models/venue.dart';

// ---------------------------------------------------------------------------
// EventSession model
// ---------------------------------------------------------------------------

class EventSession {
  const EventSession({
    required this.id,
    required this.title,
    this.titleEn,
    this.description,
    this.sessionType,
    this.venue,
    required this.startsAt,
    required this.endsAt,
    this.capacity,
    this.registeredCount = 0,
    this.isRegistrationOpen = false,
    this.zone,
    this.tags = const [],
    this.isPublished = true,
    this.speakers = const [],
    this.isInAgenda = false,
    this.isRegistered = false,
  });

  final String id;
  final String title;
  final String? titleEn;
  final String? description;
  final String? sessionType;
  final Venue? venue;
  final DateTime startsAt;
  final DateTime endsAt;
  final int? capacity;
  final int registeredCount;
  final bool isRegistrationOpen;
  final String? zone;
  final List<String> tags;
  final bool isPublished;
  final List<Speaker> speakers;

  /// Хэрэглэгчийн хөтөлбөрт нэмэгдсэн эсэх
  final bool isInAgenda;

  /// Суудал захиалсан эсэх
  final bool isRegistered;

  bool get isFull => capacity != null && registeredCount >= capacity!;

  double get capacityRatio =>
      capacity != null && capacity! > 0 ? registeredCount / capacity! : 0;

  bool get isEnded => DateTime.now().isAfter(endsAt);

  factory EventSession.fromJson(Map<String, dynamic> json) {
    final venueJson = json['venues'] as Map<String, dynamic>?;
    final speakersRaw = json['session_speakers'] as List<dynamic>? ?? [];

    return EventSession(
      id: json['id'] as String,
      title: json['title'] as String,
      titleEn: json['title_en'] as String?,
      description: json['description'] as String?,
      sessionType: json['session_type'] as String?,
      venue: venueJson != null ? Venue.fromJson(venueJson) : null,
      startsAt: DateTime.parse(json['starts_at'] as String).toLocal(),
      endsAt: DateTime.parse(json['ends_at'] as String).toLocal(),
      capacity: json['capacity'] as int?,
      registeredCount: json['registered_count'] as int? ?? 0,
      isRegistrationOpen: json['is_registration_open'] as bool? ?? false,
      zone: json['zone'] as String?,
      tags: (json['tags'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      isPublished: json['is_published'] as bool? ?? true,
      speakers: speakersRaw.map((e) {
        final map = e as Map<String, dynamic>;
        final speakerMap = map['speakers'] as Map<String, dynamic>? ?? map;
        return Speaker.fromJson({
          ...speakerMap,
          'role': map['role'],
        });
      }).toList(),
    );
  }

  EventSession copyWith({
    bool? isInAgenda,
    bool? isRegistered,
    int? registeredCount,
  }) {
    return EventSession(
      id: id,
      title: title,
      titleEn: titleEn,
      description: description,
      sessionType: sessionType,
      venue: venue,
      startsAt: startsAt,
      endsAt: endsAt,
      capacity: capacity,
      registeredCount: registeredCount ?? this.registeredCount,
      isRegistrationOpen: isRegistrationOpen,
      zone: zone,
      tags: tags,
      isPublished: isPublished,
      speakers: speakers,
      isInAgenda: isInAgenda ?? this.isInAgenda,
      isRegistered: isRegistered ?? this.isRegistered,
    );
  }
}
