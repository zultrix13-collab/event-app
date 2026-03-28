import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

// ---------------------------------------------------------------------------
// LocaleNotifier — persists locale to SharedPreferences
// Default: Mongolian ('mn')
// ---------------------------------------------------------------------------

const _kLocaleKey = 'app_locale';

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier() : super(const Locale('mn')) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final code = prefs.getString(_kLocaleKey);
    if (code != null) {
      state = Locale(code);
    }
  }

  Future<void> toggle() async {
    final next = state.languageCode == 'mn' ? const Locale('en') : const Locale('mn');
    await setLocale(next);
  }

  Future<void> setLocale(Locale locale) async {
    state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kLocaleKey, locale.languageCode);
  }
}

final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>(
  (_) => LocaleNotifier(),
);
