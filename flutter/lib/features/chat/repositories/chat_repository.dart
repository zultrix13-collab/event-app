import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:event_app/core/config/app_config.dart';
import 'package:event_app/core/supabase/supabase_client.dart';
import 'package:event_app/features/chat/models/chat_message.dart';

// ---------------------------------------------------------------------------
// ChatRepository — AI chat API-тай харилцах давхарга
// ---------------------------------------------------------------------------

class ChatRepository {
  static const _timeout = Duration(seconds: 30);

  /// AI-д мессеж илгээж, хариу авах
  Future<String> sendMessage(
    String message,
    List<ChatMessage> history,
  ) async {
    final session = SupabaseConfig.client.auth.currentSession;
    if (session == null) {
      throw Exception('Нэвтрээгүй байна. Дахин нэвтэрнэ үү.');
    }

    final uri = Uri.parse('${AppConfig.appUrl}/api/chat');
    final body = jsonEncode({
      'message': message,
      'history': history
          .where((m) => !m.isLoading)
          .map((m) => m.toHistoryMap())
          .toList(),
    });

    final response = await http
        .post(
          uri,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ${session.accessToken}',
          },
          body: body,
        )
        .timeout(_timeout);

    if (response.statusCode != 200) {
      throw Exception('Серверийн алдаа: ${response.statusCode}');
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final reply = data['reply'] as String?;

    if (reply == null || reply.isEmpty) {
      throw Exception('Хоосон хариу ирлээ.');
    }

    return reply;
  }
}
