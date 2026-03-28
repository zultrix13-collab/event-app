import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_map_tile_caching/flutter_map_tile_caching.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import 'package:event_app/features/map/models/map_poi.dart';
import 'package:event_app/features/map/providers/map_provider.dart';

// ---------------------------------------------------------------------------
// OutdoorMapView — Гадаа газрын зураг (OpenStreetMap)
// ---------------------------------------------------------------------------

const _ubCenter = LatLng(47.9077, 106.8832);

const _categoryLabels = <PoiCategory, String>{
  PoiCategory.venue: 'Заал',
  PoiCategory.hotel: 'Зочид буудал',
  PoiCategory.restaurant: 'Ресторан',
  PoiCategory.transport: 'Тээвэр',
  PoiCategory.medical: 'Эмнэлэг',
  PoiCategory.other: 'Бусад',
};

Color _categoryColor(PoiCategory cat) {
  switch (cat) {
    case PoiCategory.venue:
      return Colors.red;
    case PoiCategory.hotel:
      return Colors.blue;
    case PoiCategory.restaurant:
      return Colors.orange;
    case PoiCategory.transport:
      return Colors.green;
    case PoiCategory.medical:
      return Colors.pink;
    case PoiCategory.other:
      return Colors.grey;
  }
}

IconData _categoryIcon(PoiCategory cat) {
  switch (cat) {
    case PoiCategory.venue:
      return Icons.account_balance;
    case PoiCategory.hotel:
      return Icons.hotel;
    case PoiCategory.restaurant:
      return Icons.restaurant;
    case PoiCategory.transport:
      return Icons.directions_bus;
    case PoiCategory.medical:
      return Icons.local_hospital;
    case PoiCategory.other:
      return Icons.place;
  }
}

class OutdoorMapView extends ConsumerWidget {
  const OutdoorMapView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final poisAsync = ref.watch(poisProvider);
    final notifier = ref.read(poisProvider.notifier);

    return Column(
      children: [
        // Category filter chips
        _CategoryFilterBar(
          activeFilter: notifier.activeFilter,
          onFilter: notifier.filterByCategory,
        ),
        // Map
        Expanded(
          child: poisAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Алдаа: $e')),
            data: (pois) => _MapWidget(pois: pois),
          ),
        ),
      ],
    );
  }
}

class _CategoryFilterBar extends StatelessWidget {
  const _CategoryFilterBar({
    required this.activeFilter,
    required this.onFilter,
  });

  final PoiCategory? activeFilter;
  final void Function(PoiCategory?) onFilter;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        children: [
          FilterChip(
            label: const Text('Бүгд'),
            selected: activeFilter == null,
            onSelected: (_) => onFilter(null),
          ),
          const SizedBox(width: 6),
          ...PoiCategory.values.map((cat) => Padding(
                padding: const EdgeInsets.only(right: 6),
                child: FilterChip(
                  avatar: Icon(_categoryIcon(cat),
                      size: 16, color: _categoryColor(cat)),
                  label: Text(_categoryLabels[cat] ?? cat.name),
                  selected: activeFilter == cat,
                  onSelected: (_) =>
                      onFilter(activeFilter == cat ? null : cat),
                ),
              )),
        ],
      ),
    );
  }
}

class _MapWidget extends StatelessWidget {
  const _MapWidget({required this.pois});

  final List<MapPOI> pois;

  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      options: const MapOptions(
        initialCenter: _ubCenter,
        initialZoom: 14,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.example.event_app',
          tileProvider: FMTCStore('eventMapStore').getTileProvider(),
        ),
        MarkerLayer(
          markers: pois.map((poi) {
            return Marker(
              point: LatLng(poi.latitude, poi.longitude),
              width: 40,
              height: 40,
              child: GestureDetector(
                onTap: () => _showPoiSheet(context, poi),
                child: Container(
                  decoration: BoxDecoration(
                    color: _categoryColor(poi.category),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                    boxShadow: const [
                      BoxShadow(blurRadius: 4, color: Colors.black26),
                    ],
                  ),
                  child: Icon(
                    _categoryIcon(poi.category),
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  void _showPoiSheet(BuildContext context, MapPOI poi) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _PoiBottomSheet(poi: poi),
    );
  }
}

class _PoiBottomSheet extends StatelessWidget {
  const _PoiBottomSheet({required this.poi});

  final MapPOI poi;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(_categoryIcon(poi.category),
                color: _categoryColor(poi.category)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(poi.name,
                  style: theme.textTheme.titleLarge
                      ?.copyWith(fontWeight: FontWeight.bold)),
            ),
          ]),
          if (poi.description != null && poi.description!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(poi.description!, style: theme.textTheme.bodyMedium),
          ],
          if (poi.address != null && poi.address!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(children: [
              const Icon(Icons.location_on, size: 16, color: Colors.grey),
              const SizedBox(width: 4),
              Expanded(
                  child: Text(poi.address!,
                      style: theme.textTheme.bodySmall
                          ?.copyWith(color: Colors.grey))),
            ]),
          ],
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}
