import 'package:flutter/material.dart';

/// SaaS бүрт domain-specific content-ийг энд нэм
class PlaceholderContent extends StatelessWidget {
  const PlaceholderContent({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        border: Border.all(
          color: Theme.of(context).colorScheme.outline.withOpacity(0.3),
          width: 2,
          // ignore: deprecated_member_use
          style: BorderStyle.solid,
        ),
        borderRadius: BorderRadius.circular(12),
        color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.3),
      ),
      child: Column(
        children: [
          Icon(
            Icons.add_box_outlined,
            size: 48,
            color: Theme.of(context).colorScheme.primary.withOpacity(0.6),
          ),
          const SizedBox(height: 12),
          Text(
            'Domain-specific Content',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            'Энд SaaS-ийн үндсэн контентоо нэмнэ үү\n(жишээ: дашбоард, хүснэгт, статистик...)',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
