// lib/features/green/widgets/steps_tab.dart

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/features/green/models/step_log.dart';
import 'package:event_app/features/green/providers/green_provider.dart';

class StepsTab extends ConsumerWidget {
  const StepsTab({super.key});

  String _formatCo2(int grams) {
    if (grams >= 1000) return '${(grams / 1000).toStringAsFixed(1)} кг';
    return '$grams г';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final todayAsync = ref.watch(todayStepsProvider);
    final weeklyAsync = ref.watch(weeklyStepsProvider);
    final theme = Theme.of(context);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          color: theme.colorScheme.primaryContainer,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: todayAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Алдаа: $e'),
              data: (log) => Column(
                children: [
                  Text(
                    '${log?.steps ?? 0}',
                    style: theme.textTheme.displayLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onPrimaryContainer,
                    ),
                  ),
                  Text(
                    'алхам өнөөдөр',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: theme.colorScheme.onPrimaryContainer,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.eco, color: Colors.green, size: 20),
                      const SizedBox(width: 6),
                      Text(
                        'CO₂ хэмнэлт: ${_formatCo2(log?.co2SavedGrams ?? 0)}',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onPrimaryContainer,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        Text(
          '7 хоногийн алхам',
          style: theme.textTheme.titleMedium
              ?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 200,
          child: weeklyAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Алдаа: $e')),
            data: (logs) => WeeklyBarChart(logs: logs),
          ),
        ),
        const SizedBox(height: 20),
        FilledButton.icon(
          onPressed: () => _showManualLogDialog(context, ref),
          icon: const Icon(Icons.add),
          label: const Text('Алхам нэмэх'),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: theme.colorScheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline,
                  size: 16, color: theme.colorScheme.onSurfaceVariant),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Автомат алхам бүртгэл HealthKit/Health Connect-тэй холбогдсон төхөөрөмжид ажиллана',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showManualLogDialog(BuildContext context, WidgetRef ref) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Алхам оруулах'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'Алхамын тоо',
            hintText: '0',
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Болих'),
          ),
          FilledButton(
            onPressed: () {
              final steps = int.tryParse(controller.text);
              if (steps != null && steps > 0) {
                ref.read(stepLoggerProvider.notifier).logManualSteps(steps);
                Navigator.pop(ctx);
              }
            },
            child: const Text('Хадгалах'),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Weekly Bar Chart widget
// ---------------------------------------------------------------------------

class WeeklyBarChart extends StatelessWidget {
  const WeeklyBarChart({super.key, required this.logs});
  final List<StepLog> logs;

  static const _dayLabels = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final now = DateTime.now();
    final stepsMap = <String, int>{};
    for (final log in logs) {
      final key = log.date.toIso8601String().split('T').first;
      stepsMap[key] = log.steps;
    }
    final bars = <BarChartGroupData>[];
    for (int i = 0; i < 7; i++) {
      final day = now.subtract(Duration(days: 6 - i));
      final key = day.toIso8601String().split('T').first;
      final steps = stepsMap[key] ?? 0;
      bars.add(BarChartGroupData(
        x: i,
        barRods: [
          BarChartRodData(
            toY: steps.toDouble(),
            color: i == 6
                ? theme.colorScheme.primary
                : theme.colorScheme.primaryContainer,
            width: 20,
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(4)),
          ),
        ],
      ));
    }
    final maxY = bars
            .map((b) => b.barRods.first.toY)
            .fold<double>(0, (a, b) => a > b ? a : b) *
        1.2;
    return BarChart(
      BarChartData(
        maxY: maxY < 1000 ? 1000 : maxY,
        barGroups: bars,
        gridData: const FlGridData(show: false),
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(
          leftTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final day =
                    now.subtract(Duration(days: 6 - value.toInt()));
                final label = _dayLabels[day.weekday % 7];
                return Text(label,
                    style: TextStyle(
                        fontSize: 11,
                        color: theme.colorScheme.onSurfaceVariant));
              },
            ),
          ),
        ),
      ),
    );
  }
}
