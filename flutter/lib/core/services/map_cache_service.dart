import 'package:flutter/foundation.dart';
import 'package:flutter_map_tile_caching/flutter_map_tile_caching.dart';
import 'package:path_provider/path_provider.dart';

const _storeName = 'eventMapStore';

class MapCacheService {
  MapCacheService._();

  static bool _isAvailable = false;
  static Object? _startupError;

  static bool get isAvailable => _isAvailable;
  static Object? get startupError => _startupError;
  static String get storeName => _storeName;

  static Future<void> initialize() async {
    if (kIsWeb) {
      _disable(UnsupportedError('Offline map cache is not supported on web'));
      return;
    }

    try {
      final supportDir = await getApplicationSupportDirectory();
      final rootDirectory = '${supportDir.path}/fmtc';

      await FMTCObjectBoxBackend().initialise(rootDirectory: rootDirectory);

      final store = FMTCStore(_storeName);
      if (!await store.manage.ready) {
        await store.manage.create();
      }

      _isAvailable = true;
      _startupError = null;
      debugPrint('✅ Map cache initialized');
    } catch (error, stackTrace) {
      _disable(error);
      debugPrint('⚠️ Map cache disabled: $error');
      debugPrint(stackTrace.toString());
    }
  }

  static FMTCTileProvider? tryCreateTileProvider() {
    if (!_isAvailable) return null;

    try {
      return FMTCStore(_storeName).getTileProvider();
    } catch (error, stackTrace) {
      _disable(error);
      debugPrint('⚠️ Falling back to network map tiles: $error');
      debugPrint(stackTrace.toString());
      return null;
    }
  }

  static bool get supportsOfflineDownloads =>
      _isAvailable &&
      !kIsWeb &&
      (defaultTargetPlatform == TargetPlatform.android ||
          defaultTargetPlatform == TargetPlatform.iOS);

  static void _disable(Object error) {
    _isAvailable = false;
    _startupError = error;
  }
}
