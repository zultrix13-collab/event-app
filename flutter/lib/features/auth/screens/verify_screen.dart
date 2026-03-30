import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/features/auth/providers/auth_provider.dart';


class VerifyScreen extends ConsumerStatefulWidget {
  const VerifyScreen({super.key, required this.email});

  final String email;

  @override
  ConsumerState<VerifyScreen> createState() => _VerifyScreenState();
}

class _VerifyScreenState extends ConsumerState<VerifyScreen> {
  final _otpController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    await ref.read(authProvider.notifier).verifyOtp(
          email: widget.email,
          token: _otpController.text.trim(),
        );

    if (!mounted) return;
    setState(() => _isLoading = false);

    final error = ref.read(authProvider).error;
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error), backgroundColor: Colors.red),
      );
    }
    // Auth state өөрчлөгдвөл router автоматаар redirect хийнэ
  }

  Future<void> _resendOtp() async {
    final cooldown = ref.read(authProvider).cooldownSeconds;
    if (cooldown > 0) return;

    setState(() => _isLoading = true);
    await ref.read(authProvider.notifier).sendOtp(widget.email);

    if (!mounted) return;
    setState(() => _isLoading = false);

    final authState = ref.read(authProvider);
    final error = authState.otpError ?? authState.error;
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error), backgroundColor: Colors.red),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('OTP дахин илгээлээ'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Watch cooldown from provider
    final cooldown = ref.watch(authProvider).cooldownSeconds;
    final isOnCooldown = cooldown > 0;

    return Scaffold(
      appBar: AppBar(
        leading: BackButton(onPressed: () => context.go('/login')),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(Icons.mark_email_read_outlined, size: 64),
                const SizedBox(height: 16),
                Text(
                  'OTP шалгах',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  '${widget.email} хаяг руу OTP илгээлээ',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 40),
                TextFormField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 8,
                  textAlign: TextAlign.center,
                  enabled: !_isLoading,
                  style: Theme.of(context).textTheme.headlineMedium,
                  decoration: const InputDecoration(
                    labelText: 'OTP код',
                    hintText: '00000000',
                    counterText: '',
                  ),
                  validator: (v) {
                    if (v == null || v.length < 6) return 'OTP кодоо бүрэн оруулна уу';
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _verify,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Баталгаажуулах'),
                ),
                const SizedBox(height: 16),

                // Resend OTP button with cooldown
                TextButton(
                  onPressed: (_isLoading || isOnCooldown) ? null : _resendOtp,
                  child: Text(
                    isOnCooldown
                        ? 'Дахин илгээх (${cooldown}с)'
                        : 'Дахин илгээх',
                    style: TextStyle(
                      color: isOnCooldown
                          ? Theme.of(context).colorScheme.onSurfaceVariant
                          : Theme.of(context).colorScheme.primary,
                    ),
                  ),
                ),

                TextButton(
                  onPressed: _isLoading ? null : () => context.go('/login'),
                  child: Text(
                    'Буцах',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
