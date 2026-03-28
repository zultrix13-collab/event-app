import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:event_app/features/services/models/hotel.dart';
import 'package:event_app/features/services/providers/services_provider.dart';

class HotelScreen extends ConsumerWidget {
  const HotelScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hotelsAsync = ref.watch(hotelsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Зочид буудал')),
      body: hotelsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Алдаа: $e')),
        data: (hotels) => hotels.isEmpty
            ? const Center(child: Text('Зочид буудал олдсонгүй'))
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: hotels.length,
                itemBuilder: (context, i) => _HotelCard(hotel: hotels[i]),
              ),
      ),
    );
  }
}

class _HotelCard extends StatelessWidget {
  final Hotel hotel;
  const _HotelCard({required this.hotel});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          if (hotel.imageUrl != null)
            SizedBox(
              height: 160,
              width: double.infinity,
              child: CachedNetworkImage(
                imageUrl: hotel.imageUrl!,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) =>
                    const Icon(Icons.hotel, size: 60),
              ),
            )
          else
            Container(
              height: 120,
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
              child: const Center(child: Icon(Icons.hotel, size: 60)),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        hotel.name,
                        style: const TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ),
                    if (hotel.stars != null)
                      Text(
                        '★' * hotel.stars!,
                        style: const TextStyle(
                            color: Colors.amber, fontSize: 16),
                      ),
                  ],
                ),
                if (hotel.address != null) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on,
                          size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Expanded(
                          child: Text(hotel.address!,
                              style:
                                  const TextStyle(color: Colors.grey))),
                    ],
                  ),
                ],
                if (hotel.distanceKm != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    '📍 ${hotel.distanceKm!.toStringAsFixed(1)} км',
                    style: const TextStyle(fontSize: 13),
                  ),
                ],
                if (hotel.phone != null) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.phone, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(hotel.phone!,
                          style: const TextStyle(fontSize: 13)),
                    ],
                  ),
                ],
                if (hotel.description != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    hotel.description!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.grey),
                  ),
                ],
                const SizedBox(height: 12),
                if (hotel.bookingUrl != null)
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () => _openBookingUrl(context, hotel.bookingUrl!),
                      child: const Text('Захиалах'),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openBookingUrl(BuildContext context, String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Холбоос нээх боломжгүй')),
      );
    }
  }
}
