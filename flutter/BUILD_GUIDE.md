# Flutter Build Guide

## Prerequisites

- **Flutter SDK 3.x** — [Install Flutter](https://docs.flutter.dev/get-started/install)
- **Android Studio** (for Android builds) or **Xcode** (for iOS builds)
- **Firebase project** — see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- **Supabase project** — credentials required at build time

---

## Setup

```bash
cd flutter/

# Install dependencies
flutter pub get

# Generate code (Riverpod, JSON serialization, etc.)
flutter packages pub run build_runner build --delete-conflicting-outputs

# Generate localizations
flutter gen-l10n
```

---

## Environment Configuration

All secrets are passed as `--dart-define` flags at build/run time. They are **never** stored in source code.

```bash
# Copy the example env file for reference
cp .env.example .env
# Edit .env with your actual values (never commit this file)
```

Required variables:

| Variable         | Description                        | Example                                  |
|------------------|------------------------------------|------------------------------------------|
| `SUPABASE_URL`   | Your Supabase project URL          | `https://xxx.supabase.co`                |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key   | `eyJ...`                                 |
| `APP_URL`        | Your Next.js app URL (for AI chat) | `https://your-app.vercel.app`            |

---

## Run Locally

```bash
flutter run \
  --dart-define=SUPABASE_URL=https://xxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=APP_URL=https://your-app.vercel.app
```

> **Tip:** If you see the warning `⚠️ WARNING: App not configured`, you forgot to pass the `--dart-define` flags.

---

## Build Android APK

```bash
flutter build apk --release \
  --dart-define=SUPABASE_URL=https://xxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=APP_URL=https://your-app.vercel.app
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

### App Bundle (for Play Store)

```bash
flutter build appbundle --release \
  --dart-define=SUPABASE_URL=https://xxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=APP_URL=https://your-app.vercel.app
```

Output: `build/app/outputs/bundle/release/app-release.aab`

### Android Signing

1. Generate a keystore:
   ```bash
   keytool -genkey -v -keystore ~/event-app-key.jks \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias event-app
   ```
2. Create `android/key.properties`:
   ```properties
   storePassword=your-store-password
   keyPassword=your-key-password
   keyAlias=event-app
   storeFile=/path/to/event-app-key.jks
   ```
3. Configure `android/app/build.gradle` to reference `key.properties`.

> **Never commit** `key.properties`, `*.keystore`, or `*.jks` files.

---

## Build iOS

```bash
flutter build ipa --release \
  --dart-define=SUPABASE_URL=https://xxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=APP_URL=https://your-app.vercel.app
```

Output: `build/ios/ipa/`

### iOS Prerequisites

1. macOS with Xcode 15+ installed
2. Apple Developer account
3. Valid provisioning profile and signing certificate
4. `GoogleService-Info.plist` placed in `ios/Runner/`

---

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add Android and iOS apps to the project
3. Download config files:
   - **Android:** `google-services.json` → place in `android/app/`
   - **iOS:** `GoogleService-Info.plist` → place in `ios/Runner/`
4. See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions

An example `google-services.json` structure is in `android/app/google-services.json.example`.

---

## App Permissions

| Permission  | Platform       | Purpose                   |
|-------------|----------------|---------------------------|
| INTERNET    | Android/iOS    | All API calls             |
| CAMERA      | Android/iOS    | QR code scanning          |
| LOCATION    | Android/iOS    | Map features (optional)   |
| VIBRATE     | Android        | Notifications             |
| POST_NOTIFICATIONS | Android 13+ | Push notifications    |

---

## Troubleshooting

**Build fails with `SUPABASE_URL` not set:**
→ Ensure you pass `--dart-define` flags.

**`flutter gen-l10n` fails:**
→ Check `l10n.yaml` and ensure `.arb` files exist in `lib/l10n/`.

**Android build fails with Google Services error:**
→ Ensure `android/app/google-services.json` exists (copy from Firebase Console).

**iOS build fails with signing error:**
→ Open `ios/Runner.xcworkspace` in Xcode and fix signing settings.

**`build_runner` conflicts:**
→ Run with `--delete-conflicting-outputs` flag as shown above.
