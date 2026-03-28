import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// OrgScreen — энэ хуудас router-т шаардлагагүй болсон.
/// Ашиглагдах бол /home руу redirect хийнэ.
class OrgScreen extends StatelessWidget {
  const OrgScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Post-frame callback ашиглан redirect хийнэ (build-д context.go дуудахгүй)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (context.mounted) context.go('/home');
    });

    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
