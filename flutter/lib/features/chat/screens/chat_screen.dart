import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/features/chat/models/chat_message.dart';
import 'package:event_app/features/chat/providers/chat_provider.dart';
import 'package:event_app/features/chat/widgets/chat_bubble.dart';
import 'package:event_app/features/chat/widgets/chat_input.dart';

// ---------------------------------------------------------------------------
// ChatScreen — AI туслах дэлгэц
// ---------------------------------------------------------------------------

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _send() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    _controller.clear();
    ref.read(chatProvider.notifier).sendMessage(text);
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final messagesAsync = ref.watch(chatProvider);
    final isLoading = ref.watch(chatLoadingProvider);

    // Auto-scroll when messages change
    ref.listen(chatProvider, (_, next) {
      if (next.hasValue) _scrollToBottom();
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('🤖 Арга хэмжээний туслах'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline),
            tooltip: 'Түүх арилгах',
            onPressed: () => _confirmClear(context),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: messagesAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Алдаа: $e')),
              data: (messages) => messages.isEmpty
                  ? const _WelcomeMessage()
                  : _MessageList(
                      messages: messages,
                      scrollController: _scrollController,
                    ),
            ),
          ),
          ChatInput(
            controller: _controller,
            onSend: _send,
            isLoading: isLoading,
          ),
        ],
      ),
    );
  }

  void _confirmClear(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Түүх арилгах'),
        content: const Text('Chat түүхийг арилгах уу?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Болих'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(chatProvider.notifier).clearHistory();
            },
            child: const Text('Арилгах'),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Message list
// ---------------------------------------------------------------------------

class _MessageList extends StatelessWidget {
  const _MessageList({
    required this.messages,
    required this.scrollController,
  });

  final List<ChatMessage> messages;
  final ScrollController scrollController;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: scrollController,
      padding: const EdgeInsets.symmetric(vertical: 12),
      itemCount: messages.length,
      itemBuilder: (_, i) => ChatBubble(message: messages[i]),
    );
  }
}

// ---------------------------------------------------------------------------
// Welcome message (empty state)
// ---------------------------------------------------------------------------

class _WelcomeMessage extends StatelessWidget {
  const _WelcomeMessage();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: theme.colorScheme.secondaryContainer,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.smart_toy_outlined,
                size: 40,
                color: theme.colorScheme.onSecondaryContainer,
              ),
            ),
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '🤖 Сайн уу! Би арга хэмжээний туслах AI.',
                      style: theme.textTheme.titleSmall
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Надаас дараах зүйлсийг асууж болно:',
                      style: theme.textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 8),
                    ...[
                      '• Хөтөлбөр болон session-ийн мэдээлэл',
                      '• Газрын зураг, байршил',
                      '• Үйлчилгээ, тээвэр',
                      '• Арга хэмжээний дүрэм журам',
                    ].map(
                      (t) => Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Text(t, style: theme.textTheme.bodyMedium),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
