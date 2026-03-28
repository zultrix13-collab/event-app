import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/core/supabase/supabase_client.dart';
import 'package:event_app/features/auth/providers/auth_provider.dart';

// ---------------------------------------------------------------------------
// ApplyVipScreen — VIP эрх хүсэх маягт
// ---------------------------------------------------------------------------

class ApplyVipScreen extends ConsumerStatefulWidget {
  const ApplyVipScreen({super.key});

  @override
  ConsumerState<ApplyVipScreen> createState() => _ApplyVipScreenState();
}

class _ApplyVipScreenState extends ConsumerState<ApplyVipScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _orgController = TextEditingController();
  final _positionController = TextEditingController();
  final _reasonController = TextEditingController();

  bool _isLoading = false;
  bool _isSuccess = false;
  String? _errorMessage;

  @override
  void dispose() {
    _nameController.dispose();
    _orgController.dispose();
    _positionController.dispose();
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final user = ref.read(currentUserProvider);
      await SupabaseConfig.client.from('vip_applications').insert({
        'user_id': user?.id,
        'full_name': _nameController.text.trim(),
        'organization': _orgController.text.trim(),
        'position': _positionController.text.trim(),
        'reason': _reasonController.text.trim(),
        'status': 'pending',
      });

      if (mounted) {
        setState(() {
          _isSuccess = true;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Алдаа гарлаа: ${e.toString()}'; // Error occurred
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('VIP эрх хүсэх')),
      body: _isSuccess ? _buildSuccess(theme) : _buildForm(theme),
    );
  }

  Widget _buildSuccess(ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle, size: 72, color: theme.colorScheme.primary),
            const SizedBox(height: 24),
            Text(
              'Хүсэлт амжилттай илгээгдлээ!', // Request sent successfully!
              style: theme.textTheme.titleLarge
                  ?.copyWith(fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              'Таны хүсэлтийг администратор шалгаж, хариу мэдэгдэх болно.',
              // Your request will be reviewed by an admin.
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Буцах'), // Back
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildForm(ThemeData theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'VIP эрх хүсэхийн тулд доорх маягтыг бөглөнө үү.',
              // Fill in the form below to apply for VIP access.
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 24),

            // Full name
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Овог нэр', // Full name
                prefixIcon: Icon(Icons.person_outline),
                border: OutlineInputBorder(),
              ),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Нэрээ оруулна уу' : null,
            ),
            const SizedBox(height: 16),

            // Organization
            TextFormField(
              controller: _orgController,
              decoration: const InputDecoration(
                labelText: 'Байгууллага', // Organization
                prefixIcon: Icon(Icons.business_outlined),
                border: OutlineInputBorder(),
              ),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Байгууллага оруулна уу' : null,
            ),
            const SizedBox(height: 16),

            // Position
            TextFormField(
              controller: _positionController,
              decoration: const InputDecoration(
                labelText: 'Албан тушаал', // Position
                prefixIcon: Icon(Icons.work_outline),
                border: OutlineInputBorder(),
              ),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Албан тушаал оруулна уу' : null,
            ),
            const SizedBox(height: 16),

            // Reason
            TextFormField(
              controller: _reasonController,
              decoration: const InputDecoration(
                labelText: 'Шалтгаан', // Reason
                prefixIcon: Icon(Icons.edit_note_outlined),
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
              maxLines: 4,
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Шалтгаан оруулна уу' : null,
            ),
            const SizedBox(height: 8),

            if (_errorMessage != null) ...[
              const SizedBox(height: 8),
              Text(
                _errorMessage!,
                style: TextStyle(color: theme.colorScheme.error),
              ),
            ],
            const SizedBox(height: 24),

            FilledButton(
              onPressed: _isLoading ? null : _submit,
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Илгээх'), // Submit
            ),
          ],
        ),
      ),
    );
  }
}
