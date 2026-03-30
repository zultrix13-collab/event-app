import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:event_app/l10n/app_localizations.dart';
import 'package:event_app/core/providers/locale_provider.dart';
import 'package:event_app/core/providers/theme_provider.dart';

// ---------------------------------------------------------------------------
// SettingsScreen — Language toggle, Dark mode, App version
// ---------------------------------------------------------------------------

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final locale = ref.watch(localeProvider);
    final themeMode = ref.watch(themeProvider);
    final theme = Theme.of(context);
    final isMn = locale.languageCode == 'mn';
    final isDark = themeMode == ThemeMode.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.settings),
        leading: const BackButton(),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // --- Language ---
          Text(
            l10n.language,
            style: theme.textTheme.labelLarge?.copyWith(
              color: theme.colorScheme.primary,
            ),
          ),
          const SizedBox(height: 8),
          _LanguageToggle(
            isMn: isMn,
            mnLabel: l10n.languageMongolian,
            enLabel: l10n.languageEnglish,
            onChanged: (mn) {
              ref.read(localeProvider.notifier).setLocale(
                Locale(mn ? 'mn' : 'en'),
              );
            },
          ),
          const SizedBox(height: 24),

          // --- Theme ---
          Text(
            l10n.theme,
            style: theme.textTheme.labelLarge?.copyWith(
              color: theme.colorScheme.primary,
            ),
          ),
          const SizedBox(height: 8),
          Card(
            child: SwitchListTile(
              secondary: Icon(
                isDark ? Icons.dark_mode : Icons.light_mode_outlined,
              ),
              title: Text(l10n.darkMode),
              value: isDark,
              onChanged: (_) =>
                  ref.read(themeProvider.notifier).toggleDark(),
            ),
          ),
          const SizedBox(height: 24),

          // --- App Version ---
          Card(
            child: ListTile(
              leading: const Icon(Icons.info_outline),
              title: Text(l10n.version),
              trailing: const Text(
                '1.0.0',
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Language toggle widget
// ---------------------------------------------------------------------------

class _LanguageToggle extends StatelessWidget {
  const _LanguageToggle({
    required this.isMn,
    required this.mnLabel,
    required this.enLabel,
    required this.onChanged,
  });

  final bool isMn;
  final String mnLabel;
  final String enLabel;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: SegmentedButton<bool>(
          segments: [
            ButtonSegment(
              value: true,
              label: Text('🇲🇳  $mnLabel'),
              icon: const Icon(Icons.language),
            ),
            ButtonSegment(
              value: false,
              label: Text('🇬🇧  $enLabel'),
              icon: const Icon(Icons.language),
            ),
          ],
          selected: {isMn},
          onSelectionChanged: (set) => onChanged(set.first),
          showSelectedIcon: false,
        ),
      ),
    );
  }
}
