import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_map_tile_caching/flutter_map_tile_caching.dart';
import 'package:latlong2/latlong.dart';

// ---------------------------------------------------------------------------
// OfflineMapScreen — Download and manage cached map tiles for offline use
// ---------------------------------------------------------------------------

/// Ulaanbaatar bounding box for offline tile download
const _ubSouthWest = LatLng(47.85, 106.75);
const _ubNorthEast = LatLng(47.97, 106.97);
const _minZoom = 12;
const _maxZoom = 16;
const _storeName = 'eventMapStore';
const _osmUrlTemplate = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

class OfflineMapScreen extends StatefulWidget {
  const OfflineMapScreen({super.key});

  @override
  State<OfflineMapScreen> createState() => _OfflineMapScreenState();
}

class _OfflineMapScreenState extends State<OfflineMapScreen> {
  // Cache stats
  int _cachedTileCount = 0;
  double _cacheSizeMB = 0.0;
  bool _loadingStats = true;

  // Download state
  bool _isDownloading = false;
  int _downloadedTiles = 0;
  int _totalTiles = 0;
  StreamSubscription<DownloadProgress>? _downloadSub;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  @override
  void dispose() {
    _downloadSub?.cancel();
    super.dispose();
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  Future<void> _loadStats() async {
    setState(() => _loadingStats = true);
    try {
      final store = FMTCStore(_storeName);
      final stats = store.stats;
      final tileCount = await stats.length;
      final size = await stats.size; // in KiB
      setState(() {
        _cachedTileCount = tileCount;
        _cacheSizeMB = size / 1024;
      });
    } catch (_) {
      // Store may not exist yet — treat as empty
      setState(() {
        _cachedTileCount = 0;
        _cacheSizeMB = 0.0;
      });
    } finally {
      setState(() => _loadingStats = false);
    }
  }

  DownloadableRegion<RectangleRegion> _buildRegion() {
    return RectangleRegion(
      LatLngBounds(_ubSouthWest, _ubNorthEast),
    ).toDownloadable(
      minZoom: _minZoom,
      maxZoom: _maxZoom,
      options: TileLayer(urlTemplate: _osmUrlTemplate),
    );
  }

  Future<void> _startDownload() async {
    if (_isDownloading) return;

    // Ensure store exists
    try {
      await FMTCStore(_storeName).manage.create();
    } catch (_) {
      // Already exists — fine
    }

    final region = _buildRegion();

    // Count tiles first
    final store = FMTCStore(_storeName);

    setState(() {
      _isDownloading = true;
      _downloadedTiles = 0;
      _totalTiles = 0;
    });

    try {
      final stream = store.download.startForeground(region: region);
      _downloadSub = stream.listen(
        (progress) {
          setState(() {
            _downloadedTiles = progress.attemptedTiles;
            _totalTiles = progress.maxTiles;
          });
        },
        onDone: () async {
          setState(() => _isDownloading = false);
          _downloadSub = null;
          await _loadStats();
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Татаж авах дууслаа ✓')),
            );
          }
        },
        onError: (Object err) {
          setState(() => _isDownloading = false);
          _downloadSub = null;
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Алдаа гарлаа: $err')),
            );
          }
        },
        cancelOnError: true,
      );
    } catch (err) {
      setState(() => _isDownloading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Татаж авах боломжгүй: $err')),
        );
      }
    }
  }

  Future<void> _cancelDownload() async {
    await _downloadSub?.cancel();
    _downloadSub = null;
    await FMTCStore(_storeName).download.cancel();
    setState(() => _isDownloading = false);
  }

  Future<void> _clearCache() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Кэш цэвэрлэх'),
        content: const Text('Бүх кэшлэгдсэн өвлийн зургийг устгах уу?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Болих'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Устгах', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await FMTCStore(_storeName).manage.delete();
    } catch (_) {
      // Store didn't exist
    }
    await _loadStats();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Кэш цэвэрлэгдлээ')),
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Offline Газрын зураг'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Info banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    color: theme.colorScheme.onPrimaryContainer,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Offline горимд интернэтгүйгээр газрын зургийг харах боломжтой',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onPrimaryContainer,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Cache stats card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Кэшийн мэдээлэл',
                      style: theme.textTheme.titleMedium
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    if (_loadingStats)
                      const Center(child: CircularProgressIndicator())
                    else ...[
                      _StatRow(
                        icon: Icons.grid_view,
                        label: 'Хадгалагдсан tile',
                        value: '$_cachedTileCount ширхэг',
                      ),
                      const SizedBox(height: 8),
                      _StatRow(
                        icon: Icons.storage,
                        label: 'Зай эзэлсэн',
                        value: _cacheSizeMB < 1
                            ? '${(_cacheSizeMB * 1024).toStringAsFixed(0)} KB'
                            : '${_cacheSizeMB.toStringAsFixed(1)} MB',
                      ),
                    ],
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Download area description
            Text(
              'Уулаанбаатар хот (zoom 12–16)',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.outline,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 12),

            // Download progress / button
            if (_isDownloading) ...[
              const SizedBox(height: 8),
              LinearProgressIndicator(
                value: _totalTiles > 0 ? _downloadedTiles / _totalTiles : null,
              ),
              const SizedBox(height: 8),
              Text(
                _totalTiles > 0
                    ? '$_downloadedTiles / $_totalTiles tile татаж авлаа'
                    : '$_downloadedTiles tile татаж авлаа...',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodySmall,
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                icon: const Icon(Icons.cancel_outlined),
                label: const Text('Зогсоох'),
                onPressed: _cancelDownload,
              ),
            ] else ...[
              FilledButton.icon(
                icon: const Icon(Icons.download),
                label: const Text('Энэ хэсгийг offline татах'),
                onPressed: _startDownload,
              ),
            ],

            const SizedBox(height: 12),

            // Clear cache button
            OutlinedButton.icon(
              icon: const Icon(Icons.delete_outline, color: Colors.red),
              label: const Text(
                'Кэш цэвэрлэх',
                style: TextStyle(color: Colors.red),
              ),
              onPressed: (_loadingStats || _isDownloading) ? null : _clearCache,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.red),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Helper widgets
// ---------------------------------------------------------------------------

class _StatRow extends StatelessWidget {
  const _StatRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Colors.grey),
        const SizedBox(width: 8),
        Expanded(child: Text(label)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
      ],
    );
  }
}
