import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:event_app/features/programme/models/event_session.dart';
import 'package:event_app/features/programme/widgets/session_card.dart';

// ---------------------------------------------------------------------------
// Session list with type + day filters
// ---------------------------------------------------------------------------

class SessionFilterList extends StatelessWidget {
  const SessionFilterList({
    super.key,
    required this.sessions,
    required this.selectedType,
    required this.selectedDay,
    required this.onTypeSelected,
    required this.onDaySelected,
    required this.onSessionTap,
  });

  final List<EventSession> sessions;
  final String? selectedType;
  final DateTime? selectedDay;
  final ValueChanged<String?> onTypeSelected;
  final ValueChanged<DateTime?> onDaySelected;
  final ValueChanged<EventSession> onSessionTap;

  static final _dayFmt = DateFormat('MM/dd');

  List<EventSession> get _filtered {
    return sessions.where((s) {
      if (selectedType != null && s.sessionType != selectedType) return false;
      if (selectedDay != null) {
        final d = selectedDay!;
        if (s.startsAt.year != d.year ||
            s.startsAt.month != d.month ||
            s.startsAt.day != d.day) return false;
      }
      return true;
    }).toList();
  }

  List<String> get _types => sessions
      .map((s) => s.sessionType)
      .whereType<String>()
      .toSet()
      .toList()
    ..sort();

  List<DateTime> get _days {
    final days = sessions
        .map((s) => DateTime(s.startsAt.year, s.startsAt.month, s.startsAt.day))
        .toSet()
        .toList()
      ..sort();
    return days;
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filtered;
    final types = _types;
    final days = _days;

    return Column(
      children: [
        if (types.isNotEmpty)
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              children: [
                _Chip(label: 'Бүгд', selected: selectedType == null,
                    onSelected: (_) => onTypeSelected(null)),
                ...types.map((t) => _Chip(
                      label: _typeLabel(t),
                      selected: selectedType == t,
                      onSelected: (_) =>
                          onTypeSelected(selectedType == t ? null : t),
                    )),
              ],
            ),
          ),
        if (days.length > 1)
          SizedBox(
            height: 44,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              children: [
                _Chip(label: 'Бүх өдөр', selected: selectedDay == null,
                    onSelected: (_) => onDaySelected(null)),
                ...days.map((d) => _Chip(
                      label: _dayFmt.format(d),
                      selected: selectedDay?.day == d.day &&
                          selectedDay?.month == d.month,
                      onSelected: (_) =>
                          onDaySelected(selectedDay?.day == d.day ? null : d),
                    )),
              ],
            ),
          ),
        Expanded(
          child: filtered.isEmpty
              ? const Center(child: Text('Хөтөлбөр олдсонгүй'))
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount: filtered.length,
                  itemBuilder: (ctx, i) => SessionCard(
                    session: filtered[i],
                    onTap: () => onSessionTap(filtered[i]),
                  ),
                ),
        ),
      ],
    );
  }

  static String _typeLabel(String type) {
    const labels = {
      'keynote': 'Үндсэн',
      'workshop': 'Воркшоп',
      'panel': 'Панел',
      'breakout': 'Брэйкаут',
      'networking': 'Нетворкинг',
    };
    return labels[type] ?? type;
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.selected,
      required this.onSelected});
  final String label;
  final bool selected;
  final ValueChanged<bool> onSelected;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: selected,
        onSelected: onSelected,
        visualDensity: VisualDensity.compact,
      ),
    );
  }
}
