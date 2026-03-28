import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/features/services/providers/services_provider.dart';

class LostFoundScreen extends ConsumerStatefulWidget {
  const LostFoundScreen({super.key});

  @override
  ConsumerState<LostFoundScreen> createState() => _LostFoundScreenState();
}

class _LostFoundScreenState extends ConsumerState<LostFoundScreen>
    with SingleTickerProviderStateMixin {
  late final _tabController = TabController(length: 2, vsync: this);
  final _form = GlobalKey<FormState>();
  final _itemName = TextEditingController();
  final _description = TextEditingController();
  final _location = TextEditingController();
  final _contact = TextEditingController();
  String _type = 'lost';
  bool _loading = false;

  @override
  void dispose() {
    _tabController.dispose();
    _itemName.dispose();
    _description.dispose();
    _location.dispose();
    _contact.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Олдвор / Гээдэг'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Мэдүүлэх'),
            Tab(text: 'Миний мэдүүлэг'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildReportForm(),
          _buildMyReports(),
        ],
      ),
    );
  }

  Widget _buildReportForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _form,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Төрөл:',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: RadioListTile<String>(
                    value: 'lost',
                    groupValue: _type,
                    onChanged: (v) => setState(() => _type = v!),
                    title: const Text('Гээдэг'),
                    dense: true,
                  ),
                ),
                Expanded(
                  child: RadioListTile<String>(
                    value: 'found',
                    groupValue: _type,
                    onChanged: (v) => setState(() => _type = v!),
                    title: const Text('Олдвор'),
                    dense: true,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _itemName,
              decoration: const InputDecoration(
                labelText: 'Зүйлийн нэр *',
                border: OutlineInputBorder(),
              ),
              validator: (v) =>
                  v!.isEmpty ? 'Зүйлийн нэр оруулна уу' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _description,
              decoration: const InputDecoration(
                labelText: 'Тайлбар',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _location,
              decoration: const InputDecoration(
                labelText: 'Сүүлд харагдсан газар',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.location_on),
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _contact,
              decoration: const InputDecoration(
                labelText: 'Холбоо барих мэдээлэл',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.phone),
              ),
            ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: _loading ? null : _submit,
              child: _loading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Мэдүүлэх'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMyReports() {
    final reportsAsync = ref.watch(myLostFoundProvider);
    return reportsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Алдаа: $e')),
      data: (list) => list.isEmpty
          ? const Center(child: Text('Мэдүүлэг байхгүй'))
          : ListView.builder(
              itemCount: list.length,
              itemBuilder: (context, i) {
                final item = list[i];
                return Card(
                  margin: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 6),
                  child: ListTile(
                    leading: Icon(
                      item.type == 'lost'
                          ? Icons.search_off
                          : Icons.search,
                      color: item.type == 'lost'
                          ? Colors.orange
                          : Colors.green,
                    ),
                    title: Text(item.itemName),
                    subtitle: Text(
                      item.lastSeenLocation ??
                          item.description ??
                          '',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    trailing: _StatusBadge(
                      item.status,
                      item.type == 'lost' ? 'Гээдэг' : 'Олдвор',
                    ),
                  ),
                );
              },
            ),
    );
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      final repo = ref.read(servicesRepositoryProvider);
      await repo.reportLostFound({
        'type': _type,
        'item_name': _itemName.text.trim(),
        'description':
            _description.text.isEmpty ? null : _description.text.trim(),
        'last_seen_location':
            _location.text.isEmpty ? null : _location.text.trim(),
        'contact_info':
            _contact.text.isEmpty ? null : _contact.text.trim(),
        'status': 'open',
      });
      ref.invalidate(myLostFoundProvider);
      _itemName.clear();
      _description.clear();
      _location.clear();
      _contact.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Мэдүүлэг амжилттай илгээгдлээ ✅')),
        );
        _tabController.animateTo(1);
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

class _StatusBadge extends StatelessWidget {
  final String status;
  final String typeLabel;
  const _StatusBadge(this.status, this.typeLabel);

  @override
  Widget build(BuildContext context) {
    final isOpen = status == 'open';
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: (isOpen ? Colors.orange : Colors.green)
                .withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            isOpen ? 'Нээлттэй' : 'Шийдвэрлэгдсэн',
            style: TextStyle(
                fontSize: 11,
                color: isOpen ? Colors.orange : Colors.green),
          ),
        ),
        const SizedBox(height: 4),
        Text(typeLabel, style: const TextStyle(fontSize: 11)),
      ],
    );
  }
}
