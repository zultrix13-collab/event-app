import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/core/theme/app_theme.dart';
import 'package:event_app/features/auth/providers/auth_provider.dart';
import 'package:event_app/l10n/app_localizations.dart';

const _otpLength = 8;

class VerifyScreen extends ConsumerStatefulWidget {
  const VerifyScreen({super.key, required this.email});
  final String email;
  @override
  ConsumerState<VerifyScreen> createState() => _VerifyScreenState();
}

class _VerifyScreenState extends ConsumerState<VerifyScreen> {
  final _otpController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  final _focusNode = FocusNode();
  bool _isLoading = false;

  bool get _hasEmail => widget.email.trim().isNotEmpty;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance
        .addPostFrameCallback((_) => _focusNode.requestFocus());
  }

  @override
  void dispose() {
    _otpController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    if (!_hasEmail) return;
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
        SnackBar(content: Text(error), backgroundColor: AppTheme.danger),
      );
    }
  }

  Future<void> _resendOtp() async {
    if (!_hasEmail) return;
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
        SnackBar(content: Text(error), backgroundColor: AppTheme.danger),
      );
    } else {
      final l10n = AppLocalizations.of(context)!;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(l10n.otpSentAgain),
          backgroundColor: AppTheme.success,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final cooldown = ref.watch(authProvider).cooldownSeconds;
    final isOnCooldown = cooldown > 0;
    final size = MediaQuery.of(context).size;
    final otpValue = _otpController.text;

    return Scaffold(
      body: Stack(
        children: [
          Container(
              decoration: const BoxDecoration(gradient: AppTheme.gradientHero)),
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  const SizedBox(height: 32),
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.mark_email_read_outlined,
                      size: 36,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    l10n.verifyTitle,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _hasEmail ? widget.email : 'Имэйл мэдээлэл олдсонгүй',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontSize: 13,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            height: size.height * 0.68,
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(
                  top: Radius.circular(AppTheme.radiusXXL),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Center(
                        child: Container(
                          width: 40,
                          height: 4,
                          decoration: BoxDecoration(
                            color: Colors.grey[300],
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        l10n.verifyTitle,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF1A1A2E),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _hasEmail
                            ? l10n.verifySubtitle
                            : 'Нэвтрэх урсгал тасарсан байна. Буцаж имэйлээ дахин оруулна уу.',
                        style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 32),
                      // PIN boxes overlay with hidden input
                      GestureDetector(
                        onTap: () => _focusNode.requestFocus(),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            _OtpBoxes(value: otpValue, isLoading: _isLoading),
                            // Hidden TextFormField
                            Opacity(
                              opacity: 0,
                              child: SizedBox(
                                height: 52,
                                child: TextFormField(
                                  controller: _otpController,
                                  focusNode: _focusNode,
                                  keyboardType: TextInputType.number,
                                  maxLength: _otpLength,
                                  decoration:
                                      const InputDecoration(counterText: ''),
                                  inputFormatters: [
                                    FilteringTextInputFormatter.digitsOnly,
                                    LengthLimitingTextInputFormatter(
                                        _otpLength),
                                  ],
                                  onChanged: (v) {
                                    setState(() {});
                                    if (v.length == _otpLength) _verify();
                                  },
                                  validator: (v) {
                                    if (v == null || v.length < _otpLength) {
                                      return 'OTP кодоо бүрэн оруулна уу';
                                    }
                                    return null;
                                  },
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),
                      _GradientButton(
                        onPressed: (!_hasEmail ||
                                _isLoading ||
                                otpValue.length < _otpLength)
                            ? null
                            : _verify,
                        child: _isLoading
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Colors.white,
                                ),
                              )
                            : Text(l10n.verifyButton),
                      ),
                      const SizedBox(height: 16),
                      TextButton(
                        onPressed: (!_hasEmail || _isLoading || isOnCooldown)
                            ? null
                            : _resendOtp,
                        child: Text(
                          isOnCooldown
                              ? l10n.resendOtpCooldown(cooldown)
                              : l10n.resendOtp,
                        ),
                      ),
                      TextButton(
                        onPressed:
                            _isLoading ? null : () => context.go('/login'),
                        child: Text(
                          l10n.verifyBack,
                          style: TextStyle(color: Colors.grey[500]),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OtpBoxes extends StatelessWidget {
  final String value;
  final bool isLoading;
  const _OtpBoxes({required this.value, required this.isLoading});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(_otpLength, (i) {
        final filled = i < value.length;
        final active = i == value.length && !isLoading;
        return AnimatedContainer(
          duration: AppTheme.durationFast,
          margin: const EdgeInsets.symmetric(horizontal: 3),
          width: 34,
          height: 48,
          decoration: BoxDecoration(
            color: filled
                ? AppTheme.primary.withValues(alpha: 0.08)
                : const Color(0xFFF1F2FD),
            borderRadius: BorderRadius.circular(AppTheme.radiusSM),
            border: Border.all(
              color: active
                  ? AppTheme.primary
                  : (filled
                      ? AppTheme.primary.withValues(alpha: 0.4)
                      : Colors.transparent),
              width: active ? 2 : 1,
            ),
          ),
          child: Center(
            child: filled
                ? Text(
                    value[i],
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primary,
                    ),
                  )
                : (active
                    ? Container(
                        width: 1.5,
                        height: 22,
                        color: AppTheme.primary,
                      )
                    : null),
          ),
        );
      }),
    );
  }
}

class _GradientButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final Widget child;
  const _GradientButton({required this.onPressed, required this.child});

  @override
  Widget build(BuildContext context) {
    final disabled = onPressed == null;
    return AnimatedOpacity(
      opacity: disabled ? 0.6 : 1.0,
      duration: AppTheme.durationFast,
      child: Container(
        height: 52,
        decoration: disabled
            ? BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(AppTheme.radiusMD),
              )
            : AppTheme.gradientButtonDecoration(),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onPressed,
            borderRadius: BorderRadius.circular(AppTheme.radiusMD),
            child: Center(
              child: DefaultTextStyle(
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
                child: child,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
