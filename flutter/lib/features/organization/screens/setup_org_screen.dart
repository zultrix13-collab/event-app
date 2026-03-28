import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/features/organization/providers/org_provider.dart';
import 'package:event_app/shared/widgets/loading_widget.dart';

class SetupOrgScreen extends ConsumerStatefulWidget {
  const SetupOrgScreen({super.key});

  @override
  ConsumerState<SetupOrgScreen> createState() => _SetupOrgScreenState();
}

class _SetupOrgScreenState extends ConsumerState<SetupOrgScreen> {
  final _nameController = TextEditingController();
  final _slugController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _nameController.dispose();
    _slugController.dispose();
    super.dispose();
  }

  void _onNameChanged(String value) {
    // Auto-generate slug from name
    final slug = value.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '-');
    _slugController.text = slug;
  }

  Future<void> _create() async {
    if (!_formKey.currentState!.validate()) return;

    await ref.read(orgProvider.notifier).createOrg(
          name: _nameController.text.trim(),
          slug: _slugController.text.trim(),
        );

    if (!mounted) return;
    final error = ref.read(orgProvider).error;
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error), backgroundColor: Colors.red),
      );
    }
    // Амжилттай бол router автоматаар /home руу redirect хийнэ
  }

  @override
  Widget build(BuildContext context) {
    final orgState = ref.watch(orgProvider);

    if (orgState.isLoading) {
      return const Scaffold(body: LoadingWidget(message: 'Байгууллага үүсгэж байна...'));
    }

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(Icons.business, size: 64),
                const SizedBox(height: 16),
                Text(
                  'Байгууллага үүсгэх',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Таны арга хэмжааны workspace болно',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 40),
                TextFormField(
                  controller: _nameController,
                  onChanged: _onNameChanged,
                  decoration: const InputDecoration(
                    labelText: 'Байгууллагын нэр',
                    hintText: 'Миний Компани',
                    prefixIcon: Icon(Icons.business_outlined),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Нэр оруулна уу';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _slugController,
                  decoration: const InputDecoration(
                    labelText: 'URL slug',
                    hintText: 'minii-kompani',
                    prefixIcon: Icon(Icons.link),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Slug оруулна уу';
                    if (!RegExp(r'^[a-z0-9-]+$').hasMatch(v)) {
                      return 'Зөвхөн жижиг үсэг, тоо, зураас';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _create,
                  child: const Text('Үүсгэх'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
