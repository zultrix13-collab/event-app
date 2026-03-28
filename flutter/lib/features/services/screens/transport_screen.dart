import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:event_app/features/services/providers/services_provider.dart';

class TransportScreen extends ConsumerStatefulWidget {
  const TransportScreen({super.key});

  @override
  ConsumerState<TransportScreen> createState() => _TransportScreenState();
}

class _TransportScreenState extends ConsumerState<TransportScreen> {
  final _form = GlobalKey<FormState>();
  final _pickup = TextEditingController();
  final _dropoff = TextEditingController();
  final _notes = TextEditingController();
  String _type = 'taxi';
  DateTime _pickupTime = DateTime.now().add(const Duration(hours: 1));
  int _passengers = 1;
  bool _loading = false;

  static const _types = [
    ('taxi', 'Такси'),
    ('rental', 'Прокат'),
    ('shuttle', 'Шаттл'),
    ('airport', 'Нисэх онгоцны буудал'),
  ];

  @override
  void dispose() {
    _pickup.dispose();
    _dropoff.dispose();
    _notes.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bookingsAsync = ref.watch(myTransportBookingsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Тээвэр')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Form(
            key: _form,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Тээврийн хэрэгслийн төрөл:',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: _types.map((t) {
                    return ChoiceChip(
                      label: Text(t.$2),
                      selected: _type == t.$1,
                      onSelected: (_) => setState(() => _type = t.$1),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _pickup,
                  decoration: const InputDecoration(
                    labelText: 'Хаанаас авах',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.location_on),
                  ),
                  validator: (v) =>
                      v!.isEmpty ? 'Хаалт оруулна уу' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _dropoff,
                  decoration: const InputDecoration(
                    labelText: 'Хаана хүргэх',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.flag),
                  ),
                  validator: (v) =>
                      v!.isEmpty ? 'Хүрэх газар оруулна уу' : null,
                ),
                const SizedBox(height: 12),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Цаг:'),
                  subtitle: Text(
                    DateFormat('yyyy-MM-dd HH:mm').format(_pickupTime),
                  ),
                  trailing: const Icon(Icons.calendar_today),
                  onTap: _pickDateTime,
                ),
                Row(
                  children: [
                    const Text('Зорчигчийн тоо:'),
                    const Spacer(),
                    IconButton(
                      onPressed: _passengers > 1
                          ? () => setState(() => _passengers--)
                          : null,
                      icon: const Icon(Icons.remove),
                    ),
                    Text('$_passengers',
                        style: const TextStyle(fontSize: 18)),
                    IconButton(
                      onPressed: () => setState(() => _passengers++),
                      icon: const Icon(Icons.add),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _notes,
                  decoration: const InputDecoration(
                    labelText: 'Тэмдэглэл (заавал биш)',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Захиалах'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text('Миний захиалгууд:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          bookingsAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Text('Алдаа: $e'),
            data: (list) => list.isEmpty
                ? const Text('Захиалга байхгүй')
                : Column(
                    children: list
                        .map((b) => Card(
                              child: ListTile(
                                leading: const Icon(Icons.directions_car),
                                title: Text('${_typeLabel(b.type)}: ${b.pickupLocation} → ${b.dropoffLocation}'),
                                subtitle: Text(DateFormat('yyyy-MM-dd HH:mm')
                                    .format(b.pickupTime)),
                                trailing: _StatusBadge(b.status),
                              ),
                            ))
                        .toList(),
                  ),
          ),
        ],
      ),
    );
  }

  String _typeLabel(String type) {
    for (final t in _types) {
      if (t.$1 == type) return t.$2;
    }
    return type;
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _pickupTime,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_pickupTime),
    );
    if (time == null) return;
    setState(() {
      _pickupTime = DateTime(
          date.year, date.month, date.day, time.hour, time.minute);
    });
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      final repo = ref.read(servicesRepositoryProvider);
      await repo.createTransportBooking({
        'type': _type,
        'pickup_location': _pickup.text.trim(),
        'dropoff_location': _dropoff.text.trim(),
        'pickup_time': _pickupTime.toIso8601String(),
        'passenger_count': _passengers,
        'notes': _notes.text.trim().isEmpty ? null : _notes.text.trim(),
        'status': 'pending',
      });
      ref.invalidate(myTransportBookingsProvider);
      _pickup.clear();
      _dropoff.clear();
      _notes.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Захиалга амжилттай! ✅')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Алдаа: $e')));
      }
    } finally {
      setState(() => _loading = false);
    }
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge(this.status);

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    switch (status) {
      case 'confirmed':
        color = Colors.green;
        label = 'Баталгаажсан';
        break;
      case 'cancelled':
        color = Colors.red;
        label = 'Цуцлагдсан';
        break;
      default:
        color = Colors.orange;
        label = 'Хүлээж байна';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(label,
          style: TextStyle(color: color, fontSize: 12)),
    );
  }
}
