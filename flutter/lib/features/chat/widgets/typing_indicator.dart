import 'package:flutter/material.dart';

// ---------------------------------------------------------------------------
// TypingIndicator — 3 цэг дараалан анивчих animation
// ---------------------------------------------------------------------------

class TypingIndicator extends StatefulWidget {
  const TypingIndicator({super.key});

  @override
  State<TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<TypingIndicator>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.onSurfaceVariant;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (i) => _Dot(
        controller: _controller,
        delay: i * 0.3,
        color: color,
      )),
    );
  }
}

class _Dot extends StatelessWidget {
  const _Dot({
    required this.controller,
    required this.delay,
    required this.color,
  });

  final AnimationController controller;
  final double delay;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final animation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.3, end: 1.0), weight: 1),
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.3), weight: 1),
    ]).animate(CurvedAnimation(
      parent: controller,
      curve: Interval(delay, (delay + 0.5).clamp(0.0, 1.0),
          curve: Curves.easeInOut),
    ));

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2),
      child: AnimatedBuilder(
        animation: animation,
        builder: (_, __) => Opacity(
          opacity: animation.value,
          child: Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
        ),
      ),
    );
  }
}
