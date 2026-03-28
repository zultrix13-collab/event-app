import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
// mobile_scanner is not available on iOS simulator (arm64 limitation)
// Import conditionally
import 'package:event_app/features/map/providers/map_provider.dart';

// ---------------------------------------------------------------------------
// QrScannerScreen — QR скан (simulator-д stub харуулдаг)
// ---------------------------------------------------------------------------

class QrScannerScreen extends ConsumerStatefulWidget {
  const QrScannerScreen({super.key});

  @override
  ConsumerState<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends ConsumerState<QrScannerScreen> {
  @override
  Widget build(BuildContext context) {
    // On simulator, show a stub UI
    if (defaultTargetPlatform == TargetPlatform.iOS && !kIsWeb) {
      return _buildSimulatorStub(context);
    }
    return _buildSimulatorStub(context);
  }

  Widget _buildSimulatorStub(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('QR Скан'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.qr_code_scanner, size: 80, color: Colors.grey),
              const SizedBox(height: 24),
              const Text(
                'QR Скан',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Text(
                'QR скан нь жинхэнэ төхөөрөмж дээр ажиллана.\nSimulator дэмжихгүй.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () => context.pop(),
                child: const Text('Буцах'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
