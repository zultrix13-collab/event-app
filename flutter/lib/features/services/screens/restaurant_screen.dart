import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import 'package:event_app/features/services/models/restaurant.dart';
import 'package:event_app/features/services/providers/services_provider.dart';

class RestaurantScreen extends ConsumerWidget {
  const RestaurantScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final restaurantsAsync = ref.watch(restaurantsProvider);
    final bookingsAsync = ref.watch(myRestaurantBookingsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Ресторан')),
      body: ListView(
        children: [
          restaurantsAsync.when(
            loading: () =>
                const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Алдаа: $e')),
            data: (list) => Column(
              children: list
                  .map((r) => _RestaurantCard(restaurant: r))
                  .toList(),
            ),
          ),
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text('Миний захиалгууд:',
                style: TextStyle(
                    fontWeight: FontWeight.bold, fontSize: 16)),
          ),
          bookingsAsync.when(
            loading: () =>
                const Center(child: CircularProgressIndicator()),
            error: (e, _) => Padding(
              padding: const EdgeInsets.all(16),
              child: Text('Алдаа: $e'),
            ),
            data: (list) => list.isEmpty
                ? const Padding(
                    padding: EdgeInsets.all(16),
                    child: Text('Захиалга байхгүй'),
                  )
                : Column(
                    children: list.map((b) {
                      return ListTile(
                        leading:
                            const Icon(Icons.restaurant_menu),
                        title: Text(b.restaurantName),
                        subtitle: Text(
                          DateFormat('yyyy-MM-dd HH:mm')
                              .format(b.bookingTime),
                        ),
                        trailing: Text('${b.partySize} хүн'),
                      );
                    }).toList(),
                  ),
          ),
        ],
      ),
    );
  }
}

class _RestaurantCard extends ConsumerWidget {
  final Restaurant restaurant;
  const _RestaurantCard({required this.restaurant});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _showBookingForm(context, ref),
        child: Row(
          children: [
            SizedBox(
              width: 100,
              height: 100,
              child: restaurant.imageUrl != null
                  ? CachedNetworkImage(
                      imageUrl: restaurant.imageUrl!,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) =>
                          const Icon(Icons.restaurant),
                    )
                  : Container(
                      color: Theme.of(context)
                          .colorScheme
                          .surfaceContainerHighest,
                      child: const Icon(Icons.restaurant, size: 40),
                    ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      restaurant.name,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16),
                    ),
                    if (restaurant.cuisineType != null)
                      Text(restaurant.cuisineType!,
                          style: const TextStyle(color: Colors.grey)),
                    if (restaurant.location != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.location_on,
                              size: 14, color: Colors.grey),
                          Expanded(
                              child: Text(restaurant.location!,
                                  style:
                                      const TextStyle(fontSize: 12))),
                        ],
                      ),
                    ],
                    if (restaurant.openingHours != null)
                      Text(
                        restaurant.openingHours!,
                        style: const TextStyle(
                            fontSize: 12, color: Colors.grey),
                      ),
                  ],
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.all(8),
              child: Icon(Icons.arrow_forward_ios, size: 16),
            ),
          ],
        ),
      ),
    );
  }

  void _showBookingForm(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => _BookingFormSheet(
        restaurantName: restaurant.name,
        ref: ref,
      ),
    );
  }
}

class _BookingFormSheet extends StatefulWidget {
  final String restaurantName;
  final WidgetRef ref;

  const _BookingFormSheet({
    required this.restaurantName,
    required this.ref,
  });

  @override
  State<_BookingFormSheet> createState() => _BookingFormSheetState();
}

class _BookingFormSheetState extends State<_BookingFormSheet> {
  final _specialRequests = TextEditingController();
  DateTime _bookingTime =
      DateTime.now().add(const Duration(hours: 2));
  int _partySize = 2;
  bool _loading = false;

  @override
  void dispose() {
    _specialRequests.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            widget.restaurantName,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Захиалгын цаг:'),
            subtitle: Text(
                DateFormat('yyyy-MM-dd HH:mm').format(_bookingTime)),
            trailing: const Icon(Icons.calendar_today),
            onTap: _pickDateTime,
          ),
          Row(
            children: [
              const Text('Хүний тоо:'),
              const Spacer(),
              IconButton(
                onPressed: _partySize > 1
                    ? () => setState(() => _partySize--)
                    : null,
                icon: const Icon(Icons.remove),
              ),
              Text('$_partySize',
                  style: const TextStyle(fontSize: 18)),
              IconButton(
                onPressed: () => setState(() => _partySize++),
                icon: const Icon(Icons.add),
              ),
            ],
          ),
          TextField(
            controller: _specialRequests,
            decoration: const InputDecoration(
              labelText: 'Онцгой хүсэлт',
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
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _bookingTime,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_bookingTime),
    );
    if (time == null) return;
    setState(() {
      _bookingTime = DateTime(
          date.year, date.month, date.day, time.hour, time.minute);
    });
  }

  Future<void> _submit() async {
    setState(() => _loading = true);
    try {
      final repo = widget.ref.read(servicesRepositoryProvider);
      await repo.createRestaurantBooking({
        'restaurant_name': widget.restaurantName,
        'booking_time': _bookingTime.toIso8601String(),
        'party_size': _partySize,
        'special_requests': _specialRequests.text.isEmpty
            ? null
            : _specialRequests.text,
        'status': 'pending',
      });
      widget.ref.invalidate(myRestaurantBookingsProvider);
      if (mounted) {
        Navigator.of(context).pop();
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
