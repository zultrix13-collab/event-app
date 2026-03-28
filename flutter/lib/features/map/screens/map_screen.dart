import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:event_app/features/map/widgets/indoor_map_view.dart';
import 'package:event_app/features/map/widgets/outdoor_map_view.dart';

// ---------------------------------------------------------------------------
// MapScreen — Газрын зураг (Гадаа / Дотор)
// ---------------------------------------------------------------------------

class MapScreen extends StatelessWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Газрын зураг'),
          actions: [
            IconButton(
              icon: const Icon(Icons.download_for_offline_outlined),
              tooltip: 'Offline татах',
              onPressed: () => context.push('/map/offline'),
            ),
            IconButton(
              icon: const Icon(Icons.qr_code_scanner),
              tooltip: 'QR скан',
              onPressed: () => context.push('/map/qr-scan'),
            ),
          ],
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Гадаа'),
              Tab(text: 'Дотор'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            OutdoorMapView(),
            IndoorMapView(),
          ],
        ),
      ),
    );
  }
}
