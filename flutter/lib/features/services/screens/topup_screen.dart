import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/features/services/providers/services_provider.dart';

class TopUpScreen extends ConsumerStatefulWidget {
  const TopUpScreen({super.key});

  @override
  ConsumerState<TopUpScreen> createState() => _TopUpScreenState();
}

class _TopUpScreenState extends ConsumerState<TopUpScreen> {
  final _amountController = TextEditingController();
  Map<String, dynamic>? _invoice;
  bool _loading = false;
  bool _checking = false;

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
            const Text('Дүн сонгох:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: [10000, 20000, 50000].map((amt) {
                return ActionChip(
                  label: Text('₮${amt ~/ 1000}к'),
                  onPressed: () =>
                      _amountController.text = amt.toString(),
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
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _loading ? null : _createInvoice,
              child: _loading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('QPay нэхэмжлэл үүсгэх'),
            ),
            if (_invoice != null) ...[
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
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: _checking ? null : _checkStatus,
                icon: _checking
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.refresh),
                label: const Text('Шалгах'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildQrImage() {
    final qrImage = _invoice!['qr_image'] as String?;
    if (qrImage == null) {
      return const Center(child: Text('QR код байхгүй'));
    }
    // Could be base64 or URL
    if (qrImage.startsWith('http')) {
      return Center(
        child: Image.network(qrImage, height: 220, width: 220),
      );
    }
    try {
      final bytes = base64Decode(qrImage);
      return Center(
        child: Image.memory(bytes, height: 220, width: 220),
      );
    } catch (_) {
      return const Center(child: Text('QR код уншихад алдаа гарлаа'));
    }
  }

  Future<void> _createInvoice() async {
    final amountText = _amountController.text.trim();
    final amount = double.tryParse(amountText);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Зөв дүн оруулна уу')),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      final repo = ref.read(servicesRepositoryProvider);
      final invoice = await repo.createQPayInvoice(amount);
      setState(() => _invoice = invoice);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Алдаа: $e')));
      }
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _checkStatus() async {
    if (_invoice == null) return;
    setState(() => _checking = true);
    try {
      final repo = ref.read(servicesRepositoryProvider);
      final updated = await repo.checkQPayInvoice(_invoice!['id'] as String);
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
