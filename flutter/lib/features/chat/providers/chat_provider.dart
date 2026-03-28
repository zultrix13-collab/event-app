import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/features/chat/models/chat_message.dart';
import 'package:event_app/features/chat/repositories/chat_repository.dart';

// ---------------------------------------------------------------------------
// Repository provider
// ---------------------------------------------------------------------------

final chatRepositoryProvider = Provider<ChatRepository>(
  (_) => ChatRepository(),
);

// ---------------------------------------------------------------------------
// ChatNotifier — Chat state удирдлага
// ---------------------------------------------------------------------------

class ChatNotifier extends AsyncNotifier<List<ChatMessage>> {
  ChatRepository get _repo => ref.read(chatRepositoryProvider);

  @override
  Future<List<ChatMessage>> build() async => [];

  /// Мессеж илгээх
  Future<void> sendMessage(String text) async {
    final currentMessages = state.valueOrNull ?? [];

    // 1. Хэрэглэгчийн мессеж нэмэх
    final userMsg = ChatMessage(role: 'user', content: text);
    final withUser = [...currentMessages, userMsg];
    state = AsyncData(withUser);

    // 2. Typing indicator нэмэх
    final loadingMsg = ChatMessage(
      role: 'assistant',
      content: '',
      isLoading: true,
    );
    state = AsyncData([...withUser, loadingMsg]);

    // 3. Repository-оос хариу авах
    try {
      final reply = await _repo.sendMessage(text, withUser);

      // 4. Loading мессежийг хариугаар солих
      final messages = state.valueOrNull ?? [];
      final updated = messages
          .where((m) => m.id != loadingMsg.id)
          .toList()
        ..add(ChatMessage(role: 'assistant', content: reply));
      state = AsyncData(updated);
    } catch (e) {
      // 5. Алдааг chat-д харуулах
      final messages = state.valueOrNull ?? [];
      final updated = messages
          .where((m) => m.id != loadingMsg.id)
          .toList()
        ..add(ChatMessage(
          role: 'assistant',
          content: '⚠️ Алдаа гарлаа: ${_friendlyError(e)}',
        ));
      state = AsyncData(updated);
    }
  }

  /// Түүхийг арилгах
  void clearHistory() {
    state = const AsyncData([]);
  }

  String _friendlyError(Object e) {
    final msg = e.toString();
    if (msg.contains('нэвтрээгүй')) return 'Нэвтрээгүй байна.';
    if (msg.contains('timeout') || msg.contains('TimeoutException')) {
      return 'Хугацаа хэтэрлээ. Дахин оролдоно уу.';
    }
    if (msg.contains('SocketException') || msg.contains('network')) {
      return 'Интернэт холболт шалгана уу.';
    }
    return 'Дахин оролдоно уу.';
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final chatProvider =
    AsyncNotifierProvider<ChatNotifier, List<ChatMessage>>(ChatNotifier.new);

/// Ачааллаж байгаа эсэх (typing indicator харуулна)
final chatLoadingProvider = Provider<bool>((ref) {
  final messages = ref.watch(chatProvider).valueOrNull ?? [];
  return messages.any((m) => m.isLoading);
});
