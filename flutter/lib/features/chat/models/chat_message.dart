// ---------------------------------------------------------------------------
// ChatMessage — AI chat-ийн мессежийн загвар
// ---------------------------------------------------------------------------

class ChatMessage {
  ChatMessage({
    String? id,
    required this.role,
    required this.content,
    DateTime? createdAt,
    this.isLoading = false,
  })  : id = id ?? _generateId(),
        createdAt = createdAt ?? DateTime.now();

  static String _generateId() =>
      '${DateTime.now().microsecondsSinceEpoch}_${Object().hashCode}';

  final String id;

  /// 'user' | 'assistant'
  final String role;

  final String content;
  final DateTime createdAt;

  /// Typing indicator үзүүлэхэд true
  final bool isLoading;

  bool get isUser => role == 'user';
  bool get isAssistant => role == 'assistant';

  ChatMessage copyWith({
    String? id,
    String? role,
    String? content,
    DateTime? createdAt,
    bool? isLoading,
  }) {
    return ChatMessage(
      id: id ?? this.id,
      role: role ?? this.role,
      content: content ?? this.content,
      createdAt: createdAt ?? this.createdAt,
      isLoading: isLoading ?? this.isLoading,
    );
  }

  Map<String, dynamic> toHistoryMap() => {
        'role': role,
        'content': content,
      };
}
