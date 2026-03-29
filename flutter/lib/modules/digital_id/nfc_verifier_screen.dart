import 'package:flutter/material.dart';
import 'package:flutter_nfc_kit/flutter_nfc_kit.dart';
import 'digital_id_service.dart';

enum VerifyState { idle, scanning, success, error }

class NfcVerifierScreen extends StatefulWidget {
  const NfcVerifierScreen({super.key});

  @override
  State<NfcVerifierScreen> createState() => _NfcVerifierScreenState();
}

class _NfcVerifierScreenState extends State<NfcVerifierScreen> {
  VerifyState _state = VerifyState.idle;
  String? _message;
  DigitalIdPayload? _payload;

  Future<void> _scan() async {
    final avail = await FlutterNfcKit.nfcAvailability;
    if (avail != NFCAvailability.available) {
      setState(() { _state = VerifyState.error; _message = 'NFC дэмжигдэхгүй байна'; });
      return;
    }

    setState(() { _state = VerifyState.scanning; _message = 'Утасаа ойртуулна уу...'; });

    try {
      await FlutterNfcKit.poll(timeout: const Duration(seconds: 30));
      final records = await FlutterNfcKit.readNDEFRecords(cached: false);

      String? qrData;
      for (final r in records) {
        if (r.payload != null && r.payload!.contains('.')) {
          qrData = r.payload;
          break;
        }
      }

      if (qrData == null) throw Exception('Мэдээлэл олдсонгүй');
      final parsed = DigitalIdService.parseQrData(qrData);
      if (parsed == null) throw Exception('Формат буруу');

      final result = DigitalIdService.verify(parsed.payload, parsed.signature);
      if (!result.valid) throw Exception(result.error);

      setState(() { _state = VerifyState.success; _message = 'Баталгаажлаа ✓'; _payload = result.payload; });
    } catch (e) {
      setState(() { _state = VerifyState.error; _message = e.toString(); });
    } finally {
      await FlutterNfcKit.finish();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('NFC Баталгаажуулалт')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            _stateIcon(),
            const SizedBox(height: 24),
            if (_message != null) Text(_message!,
              style: TextStyle(
                fontSize: 18, fontWeight: FontWeight.w600,
                color: _state == VerifyState.success ? Colors.green
                  : _state == VerifyState.error ? Colors.red : Colors.grey,
              ), textAlign: TextAlign.center),
            if (_payload != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.green[50], borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Дүр: ${_payload!.role.toUpperCase()}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text('ID: ${_payload!.userId.substring(0, 8)}...'),
                ]),
              ),
            ],
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: _state == VerifyState.scanning ? null : _scan,
              icon: const Icon(Icons.nfc),
              label: Text(_state == VerifyState.scanning ? 'Хүлээж байна...' : 'NFC Уншуулах'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF16a34a), foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ]),
        ),
      ),
    );
  }

  Widget _stateIcon() {
    switch (_state) {
      case VerifyState.idle: return const Icon(Icons.nfc, size: 80, color: Colors.grey);
      case VerifyState.scanning: return const CircularProgressIndicator(color: Color(0xFF16a34a));
      case VerifyState.success: return const Icon(Icons.check_circle, size: 80, color: Colors.green);
      case VerifyState.error: return const Icon(Icons.cancel, size: 80, color: Colors.red);
    }
  }
}
