// lib/features/green/models/step_log.dart

class StepLog {
  const StepLog({
    required this.id,
    required this.userId,
    required this.steps,
    required this.date,
    required this.co2SavedGrams,
    required this.source,
    required this.createdAt,
  });

  final String id;
  final String userId;
  final int steps;
  final DateTime date;
  final int co2SavedGrams;
  final String source;
  final DateTime createdAt;

  factory StepLog.fromJson(Map<String, dynamic> json) {
    return StepLog(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      steps: json['steps'] as int,
      date: DateTime.parse(json['date'] as String),
      co2SavedGrams: json['co2_saved_grams'] as int? ?? 0,
      source: json['source'] as String? ?? 'manual',
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'user_id': userId,
        'steps': steps,
        'date': date.toIso8601String().split('T').first,
        'co2_saved_grams': co2SavedGrams,
        'source': source,
        'created_at': createdAt.toIso8601String(),
      };
}
