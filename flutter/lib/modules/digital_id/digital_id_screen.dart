import 'dart:async';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'digital_id_service.dart';

class DigitalIdScreen extends StatefulWidget {
  final String userId;
  final String role;
  final String userName;

  const DigitalIdScreen({
    super.key,
    required this.userId,
    required this.role,
    required this.userName,
  });

  @override
  State<DigitalIdScreen> createState() => _DigitalIdScreenState();
}

class _DigitalIdScreenState extends State<DigitalIdScreen> {
  DigitalIdResult? _currentId;
  Timer? _refreshTimer;
  int _secondsRemaining = 0;

  @override
  void initState() {
    super.initState();
    _generateId();
    _startTimer();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  void _generateId() {
    final result = DigitalIdService.generate(widget.userId, widget.role);
    setState(() {
      _currentId = result;
      _secondsRemaining = 15 * 60;
    });
  }

  void _startTimer() {
    _refreshTimer?.cancel();
    _refreshTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_secondsRemaining <= 1) {
        _generateId();
      } else {
        setState(() => _secondsRemaining--);
      }
    });
  }

  String get _timerText {
    final m = _secondsRemaining ~/ 60;
    final s = _secondsRemaining % 60;
    return '${m.toString().padLeft(2,'0')}:${s.toString().padLeft(2,'0')}';
  }

  Color get _timerColor => _secondsRemaining > 300
    ? Colors.green
    : _secondsRemaining > 60 ? Colors.orange : Colors.red;

  @override
  Widget build(BuildContext context) {
    final id = _currentId;
    return Scaffold(
      backgroundColor: const Color(0xFF16a34a),
      appBar: AppBar(
        title: const Text('Дижитал Үнэмлэх'),
        backgroundColor: const Color(0xFF15803d),
        foregroundColor: Colors.white,
      ),
      body: id == null
        ? const Center(child: CircularProgressIndicator(color: Colors.white))
        : SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(children: [
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 20, offset: const Offset(0, 8))],
                ),
                padding: const EdgeInsets.all(24),
                child: Column(children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                      color: widget.role == 'vip' ? const Color(0xFF7c3aed) : const Color(0xFF16a34a),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(widget.role.toUpperCase(),
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                  ),
                  const SizedBox(height: 12),
                  Text(widget.userName,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1e293b))),
                  const SizedBox(height: 20),
                  QrImageView(
                    data: id.qrData,
                    version: QrVersions.auto,
                    size: 220,
                    eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: Color(0xFF16a34a)),
                    dataModuleStyle: const QrDataModuleStyle(
                      dataModuleShape: QrDataModuleShape.square, color: Color(0xFF1e293b)),
                  ),
                  const SizedBox(height: 12),
                  Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.timer, size: 16, color: _timerColor),
                    const SizedBox(width: 4),
                    Text('Шинэчлэгдэх: $_timerText',
                      style: TextStyle(color: _timerColor, fontWeight: FontWeight.w600)),
                  ]),
                ]),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(children: [
                  Icon(Icons.nfc, color: Colors.white),
                  SizedBox(width: 12),
                  Expanded(child: Text('NFC-ээр tap хийж нэвтрэх боломжтой',
                    style: TextStyle(color: Colors.white))),
                ]),
              ),
              TextButton.icon(
                onPressed: _generateId,
                icon: const Icon(Icons.refresh, color: Colors.white),
                label: const Text('Шинэчлэх', style: TextStyle(color: Colors.white)),
              ),
            ]),
          ),
    );
  }
}
