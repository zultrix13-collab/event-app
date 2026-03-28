import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:event_app/features/map/models/floor_plan.dart';
import 'package:event_app/features/map/models/indoor_zone.dart';
import 'package:event_app/features/map/providers/map_provider.dart';

// ---------------------------------------------------------------------------
// IndoorMapView — Дотоод газрын зураг
// ---------------------------------------------------------------------------

class IndoorMapView extends ConsumerStatefulWidget {
  const IndoorMapView({super.key});

  @override
  ConsumerState<IndoorMapView> createState() => _IndoorMapViewState();
}

class _IndoorMapViewState extends ConsumerState<IndoorMapView> {
  FloorPlan? _selectedFloor;

  @override
  Widget build(BuildContext context) {
    final floorPlansAsync = ref.watch(floorPlansProvider);

    return floorPlansAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Алдаа: $e')),
      data: (floors) {
        if (floors.isEmpty) {
          return const _NoMapPlaceholder();
        }
        // Set default selection
        _selectedFloor ??= floors.first;
        return Column(
          children: [
            _FloorSelector(
              floors: floors,
              selected: _selectedFloor!,
              onSelect: (f) => setState(() => _selectedFloor = f),
            ),
            Expanded(
              child: _FloorMapView(floorPlan: _selectedFloor!),
            ),
          ],
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Floor selector chips
// ---------------------------------------------------------------------------

class _FloorSelector extends StatelessWidget {
  const _FloorSelector({
    required this.floors,
    required this.selected,
    required this.onSelect,
  });

  final List<FloorPlan> floors;
  final FloorPlan selected;
  final void Function(FloorPlan) onSelect;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        children: floors.map((floor) {
          final label = '${floor.floorNumber}-р давхар';
          return Padding(
            padding: const EdgeInsets.only(right: 6),
            child: ChoiceChip(
              label: Text(label),
              selected: selected.id == floor.id,
              onSelected: (_) => onSelect(floor),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Floor map with zone overlays
// ---------------------------------------------------------------------------

class _FloorMapView extends ConsumerWidget {
  const _FloorMapView({required this.floorPlan});

  final FloorPlan floorPlan;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final zonesAsync = ref.watch(zonesProvider(floorPlan.id));

    return zonesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Алдаа: $e')),
      data: (zones) => _SvgMapWithZones(
        floorPlan: floorPlan,
        zones: zones,
      ),
    );
  }
}

class _SvgMapWithZones extends StatelessWidget {
  const _SvgMapWithZones({
    required this.floorPlan,
    required this.zones,
  });

  final FloorPlan floorPlan;
  final List<IndoorZone> zones;

  @override
  Widget build(BuildContext context) {
    if (!floorPlan.hasSvgContent && !floorPlan.hasSvgUrl) {
      return const _NoMapPlaceholder();
    }

    return LayoutBuilder(builder: (context, constraints) {
      final width = constraints.maxWidth;
      final height = constraints.maxHeight;

      return InteractiveViewer(
        minScale: 0.5,
        maxScale: 4.0,
        child: SizedBox(
          width: width,
          height: height,
          child: Stack(
            children: [
              // SVG layer
              Positioned.fill(
                child: floorPlan.hasSvgContent
                    ? SvgPicture.string(
                        floorPlan.svgContent!,
                        fit: BoxFit.contain,
                      )
                    : SvgPicture.network(
                        floorPlan.svgUrl!,
                        fit: BoxFit.contain,
                        placeholderBuilder: (_) => const Center(
                            child: CircularProgressIndicator()),
                      ),
              ),
              // Zone labels overlay
              ...zones.map((zone) => _ZoneLabel(
                    zone: zone,
                    containerWidth: width,
                    containerHeight: height,
                  )),
            ],
          ),
        ),
      );
    });
  }
}

class _ZoneLabel extends StatelessWidget {
  const _ZoneLabel({
    required this.zone,
    required this.containerWidth,
    required this.containerHeight,
  });

  final IndoorZone zone;
  final double containerWidth;
  final double containerHeight;

  @override
  Widget build(BuildContext context) {
    final left = containerWidth * zone.xPercent / 100;
    final top = containerHeight * zone.yPercent / 100;

    return Positioned(
      left: left,
      top: top,
      child: GestureDetector(
        onTap: () => _showZoneSheet(context, zone),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: _parseColor(zone.color) ?? Colors.blue.withOpacity(0.75),
            borderRadius: BorderRadius.circular(6),
            boxShadow: const [BoxShadow(blurRadius: 3, color: Colors.black26)],
          ),
          child: Text(
            zone.name,
            style: const TextStyle(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.w600),
          ),
        ),
      ),
    );
  }

  Color? _parseColor(String? hex) {
    if (hex == null || hex.isEmpty) return null;
    try {
      final clean = hex.replaceFirst('#', '');
      return Color(int.parse('FF$clean', radix: 16));
    } catch (_) {
      return null;
    }
  }

  void _showZoneSheet(BuildContext context, IndoorZone zone) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(zone.name,
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.bold)),
            if (zone.zoneType != null) ...[
              const SizedBox(height: 6),
              Chip(label: Text(zone.zoneType!)),
            ],
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Placeholder
// ---------------------------------------------------------------------------

class _NoMapPlaceholder extends StatelessWidget {
  const _NoMapPlaceholder();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.map_outlined,
              size: 64, color: theme.colorScheme.onSurfaceVariant),
          const SizedBox(height: 12),
          Text(
            'Газрын зураг удахгүй нэмэгдэнэ',
            style: theme.textTheme.bodyLarge
                ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
          ),
        ],
      ),
    );
  }
}
