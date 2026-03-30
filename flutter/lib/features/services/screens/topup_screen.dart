import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uuid/uuid.dart';
import 'package:event_app/features/services/providers/services_provider.dart';

enum _PaymentMethod { qpay, socialPay }

class TopUpScreen extends ConsumerStatefulWidget {
  const TopUpScreen({super.key});

  @override
  ConsumerState<TopUpScreen> createState() => _TopUpScreenState();
}

class _TopUpScreenState extends ConsumerState<TopUpScreen> {
  final _amountController = TextEditingController();
  _PaymentMethod _method = _PaymentMethod.qpay;
  Map<String, dynamic>? _invoice;
  bool _loading = false;
  bool _checking = false;
  String? _error;

  static const _presets = [10000, 20000, 50000];

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Хэтэвч цэнэглэх')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Preset amounts
            const Text('Дүн сонгох:',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: _presets.map((amt) {
                return ActionChip(
                  label: Text('₮${(amt ~/ 1000)}к'),
                  onPressed: () =>
                      setState(() => _amountController.text = amt.toString()),
                );
              }).toList(),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Дүн (₮)',
                prefixText: '₮',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),

            // Payment method toggle
            const Text('Төлбөрийн арга:',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _MethodCard(
                    emoji: '🔵',
                    label: 'QPay',
                    selected: _method == _PaymentMethod.qpay,
                    onTap: () => setState(() => _method = _PaymentMethod.qpay),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _MethodCard(
                    emoji: '🟢',
                    label: 'SocialPay',
                    selected: _method == _PaymentMethod.socialPay,
                    onTap: () =>
                        setState(() => _method = _PaymentMethod.socialPay),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            if (_error != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Text(
                  '⚠️ $_error',
                  style: TextStyle(color: Colors.red.shade700, fontSize: 13),
                ),
              ),
              const SizedBox(height: 12),
            ],

            FilledButton(
              onPressed: _loading ? null : _createTopup,
              child: _loading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : Text(_method == _PaymentMethod.qpay
                      ? 'QPay нэхэмжлэл үүсгэх'
                      : 'SocialPay-аар цэнэглэх'),
            ),

            // QPay invoice QR
            if (_invoice != null && _method == _PaymentMethod.qpay) ...[
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),
              const Text('QPay QR код:',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              _buildQrImage(),
              const SizedBox(height: 8),
              Text(
                'Статус: ${_invoiceStatusLabel(_invoice!['status'] ?? '')}',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13),
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: _checking ? null : _checkQPayStatus,
                icon: _checking
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.refresh),
                label: const Text('Статус шалгах'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildQrImage() {
    final qrImage = _invoice?['qr_image'] as String?;
    if (qrImage == null) {
      return const Center(child: Text('QR код байхгүй'));
    }
    if (qrImage.startsWith('http')) {
      return Center(child: Image.network(qrImage, height: 220, width: 220));
    }
    try {
      final bytes = base64Decode(qrImage);
      return Center(child: Image.memory(bytes, height: 220, width: 220));
    } catch (_) {
      return const Center(child: Text('QR код уншихад алдаа гарлаа'));
    }
  }

  Future<void> _createTopup() async {
    final amountText = _amountController.text.trim();
    final amount = double.tryParse(amountText);
    if (amount == null || amount < 1000) {
      setState(() => _error = 'Хамгийн багадаа ₮1,000 оруулна уу');
      return;
    }
    setState(() { _loading = true; _error = null; });

    try {
      final repo = ref.read(servicesRepositoryProvider);

      if (_method == _PaymentMethod.qpay) {
        final invoice = await repo.createQPayInvoice(amount);
        setState(() => _invoice = invoice);
      } else {
        // SocialPay: call wallet_transfer with 'topup' type via RPC
        final idempotencyKey = const Uuid().v4();
        final userId = Supabase.instance.client.auth.currentUser?.id;
        if (userId == null) throw Exception('Нэвтрэч орно уу');

        final response = await Supabase.instance.client.rpc('wallet_transfer', params: {
          'p_user_id': userId,
          'p_amount': amount,
          'p_type': 'topup',
          'p_idempotency_key': 'topup:socialpay:$idempotencyKey',
          'p_description': 'SocialPay цэнэглэлт ₮${amount.toStringAsFixed(0)}',
        });

        final result = response as Map<String, dynamic>?;
        if (result?['success'] == true) {
          ref.invalidate(walletProvider);
          ref.invalidate(walletTransactionsProvider);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Цэнэглэлт амжилттай! ✅')),
            );
            _amountController.clear();
          }
        } else {
          final msg = result?['error'] as String? ?? 'SocialPay алдаа гарлаа';
          setState(() => _error = msg.contains('insufficient')
              ? 'Хэтэвчний үлдэгдэл хүрэлцэхгүй байна'
              : msg);
        }
      }
    } catch (e) {
      setState(() => _error = 'Алдаа: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _checkQPayStatus() async {
    if (_invoice == null) return;
    setState(() => _checking = true);
    try {
      final repo = ref.read(servicesRepositoryProvider);
      final updated =
          await repo.checkQPayInvoice(_invoice!['id'] as String);
      if (updated != null) {
        setState(() => _invoice = updated);
        if (updated['status'] == 'paid' && mounted) {
          ref.invalidate(walletProvider);
          ref.invalidate(walletTransactionsProvider);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Төлбөр амжилттай хийгдлээ! ✅')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Алдаа: $e')));
      }
    } finally {
      setState(() => _checking = false);
    }
  }

  String _invoiceStatusLabel(String status) {
    switch (status) {
      case 'paid':
        return '✅ Төлөгдсөн';
      case 'pending':
        return '⏳ Хүлээж байна';
      case 'expired':
        return '❌ Хугацаа дуусган';
      default:
        return status;
    }
  }
}

class _MethodCard extends StatelessWidget {
  final String emoji;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _MethodCard({
    required this.emoji,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: selected
              ? theme.colorScheme.primaryContainer
              : theme.colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: selected
                ? theme.colorScheme.primary
                : Colors.transparent,
            width: 2,
          ),
        ),
        child: Column(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 24)),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: selected
                    ? theme.colorScheme.primary
                    : theme.colorScheme.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
