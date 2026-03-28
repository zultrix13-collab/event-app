# Firebase Setup Guide

This guide walks you through setting up Firebase Cloud Messaging (FCM) for the event app.

---

## Prerequisites

- Flutter SDK installed
- A Google account
- Access to `android/` and `ios/` directories

---

## Step 1 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Enter a project name (e.g., `event-app`)
4. Enable or disable Google Analytics as needed
5. Click **Create project**

---

## Step 2 — Add Android App

1. In Firebase console, click **Add app** → Android icon
2. Enter the package name from `android/app/src/main/AndroidManifest.xml`  
   (look for `package="..."` — e.g., `com.example.event_app`)
3. Optionally enter a nickname and SHA-1 certificate fingerprint
4. Click **Register app**
5. Download **`google-services.json`**
6. Place it in `android/app/google-services.json`

### Android Gradle configuration

In `android/build.gradle` (project-level), add to `dependencies`:
```groovy
classpath 'com.google.gms:google-services:4.4.0'
```

In `android/app/build.gradle` (app-level), add at the bottom:
```groovy
apply plugin: 'com.google.gms.google-services'
```

---

## Step 3 — Add iOS App

1. In Firebase console, click **Add app** → iOS icon
2. Enter the bundle ID from Xcode → Signing & Capabilities  
   (e.g., `com.example.eventApp`)
3. Download **`GoogleService-Info.plist`**
4. In Xcode, right-click `Runner/` → **Add Files to "Runner"**
5. Select `GoogleService-Info.plist` and click **Add**

### iOS APNs setup (required for push on iOS)

1. Go to Firebase Console → Project Settings → Cloud Messaging → iOS app
2. Upload your APNs Auth Key (from Apple Developer Portal)
   - Apple Developer → Certificates, Identifiers & Profiles → Keys → Create new key with "Apple Push Notifications service" enabled
   - Download the `.p8` file and upload it to Firebase with your Key ID and Team ID

---

## Step 4 — Install FlutterFire CLI and generate options

```bash
dart pub global activate flutterfire_cli
flutterfire configure --project=your-firebase-project-id
```

This generates `lib/firebase_options.dart`.

---

## Step 5 — Uncomment Firebase code

In `lib/core/notifications/push_notification_service.dart`:

1. Uncomment the imports at the top:
   ```dart
   import 'package:firebase_core/firebase_core.dart';
   import 'package:firebase_messaging/firebase_messaging.dart';
   import 'firebase_options.dart';
   ```

2. Uncomment the initialization block inside `initialize()`:
   ```dart
   await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
   final messaging = FirebaseMessaging.instance;
   await messaging.requestPermission(...);
   final token = await messaging.getToken();
   await _saveTokenToSupabase(token);
   FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
   FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundTap);
   ```

In `lib/main.dart`:
- Uncomment: `PushNotificationService.instance.initialize();`

---

## Step 6 — Run flutter pub get

```bash
flutter pub get
```

---

## Step 7 — Add FCM token column to Supabase profiles table

Run this SQL in the Supabase SQL editor:

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS fcm_token TEXT;
```

Optionally add an index if you query by token:
```sql
CREATE INDEX IF NOT EXISTS idx_profiles_fcm_token ON profiles(fcm_token);
```

Then implement `_saveTokenToSupabase` in `push_notification_service.dart`:

```dart
Future<void> _saveTokenToSupabase(String? token) async {
  if (token == null) return;
  final userId = supabase.auth.currentUser?.id;
  if (userId == null) return;
  await supabase
    .from('profiles')
    .update({'fcm_token': token})
    .eq('id', userId);
}
```

---

## Step 8 — Test a push notification

From Firebase Console → Cloud Messaging:
1. Click **Send your first message**
2. Enter title and body
3. Target your app
4. Click **Send**

Or use the Firebase Admin SDK / REST API to send to a specific FCM token.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| iOS notifications not received | Check APNs key is uploaded in Firebase console |
| `google-services.json` not found | Ensure file is in `android/app/`, not `android/` |
| FCM token is null | Check permissions were granted; try on a real device |
| Android build fails | Verify `google-services` plugin is applied in both gradle files |
