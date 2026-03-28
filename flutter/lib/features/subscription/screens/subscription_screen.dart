import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// SubscriptionScreen — энэ хуудас router-т шаардлагагүй болсон.
/// Ашиглагдах бол /home руу redirect хийнэ.
class SubscriptionScreen extends StatelessWidget {
  const SubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (context.mounted) context.go('/home');
    });

    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
