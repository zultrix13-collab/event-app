# Хэрэгжүүлэх Нарийвчилсан Төлөвлөгөө
## Event Digital Platform | 2026-03-30

> **Суурь баримт:** `docs/SYSTEM_REQUIREMENTS.md` + `docs/GAP_ANALYSIS.md`
> 
> Хөгжүүлэлтийн баг: PM · Frontend · Backend · DB · QA · UX/UI
> 
> Sprint урт: **2 долоо хоног** | Нийт: **6 Sprint** (~3 сар)

---

## ЕРӨНХИЙ ДҮРЭМ

- Спринт бүрийн эцэст demo + QA review хийнэ
- Шаардлагын `SYSTEM_REQUIREMENTS.md`-аас гарсан аливаа өөрчлөлтийг PM батална
- Устгах migration хийхээс өмнө заавал Лхагвасүрэн зөвшөөрнө
- Нэг PR = нэг feature/fix — том PR-аас зайлсхийх
- Test coverage: API route бүрт хамгийн багадаа 1 unit test

---

## SPRINT 1 — Суурийн Батлалт ба Эрсдэлийн Бууруулалт
### 2 долоо хоног | Зорилго: Хамгийн их эрсдэлтэй 4 хэсгийн PoC

---

### 1.1 PROG-02 — Суудал захиалгын Race Condition Хамгаалалт

**Яагаад 1-р зэрэглэл вэ?** 10,000+ хэрэглэгч нэгэн зэрэг бүртгүүлж давхар захиалга үүсч болно.

**Одоогийн байдал:** `src/modules/programme/actions.ts` дахь `registerForSession` функц read → write хооронд race condition-тэй.

**Хийх зүйл:**

```
DB Migration:
  - event_sessions хүснэгтэд advisory lock эсвэл
  - registered_count-г атомик increment болгох

src/modules/programme/actions.ts:
  - registerForSession → Supabase RPC (database function) болгох
  - DB function доторх FOR UPDATE SKIP LOCKED

supabase/migrations/YYYYMMDD_seat_lock.sql:
  CREATE OR REPLACE FUNCTION register_for_session(p_session_id uuid, p_user_id uuid)
  RETURNS json LANGUAGE plpgsql AS $$
  DECLARE
    v_session event_sessions%ROWTYPE;
    v_status text;
  BEGIN
    SELECT * INTO v_session FROM event_sessions
      WHERE id = p_session_id FOR UPDATE;
    -- capacity check
    -- upsert seat_registration
    -- increment registered_count
    RETURN json_build_object('status', v_status);
  END;
  $$;

tests/programme/seat-registration.test.ts:
  - 200 нэгэн зэрэг хүсэлт → зөвхөн capacity тооны confirmed
  - waitlist урт зөв байгааг шалгах
```

**Хүлээгдэх үр дүн:** `registered_count` хэзээ ч `capacity`-аас хэтрэхгүй. Давхар бүртгэл 0.

**Баг:** Backend + DB

---

### 1.2 PAY-01 — Wallet ACID Transaction + Idempotency

**Яагаад 1-р зэрэглэл вэ?** Хэрэглэгчийн мөнгийг хамгаалах — давхар цэнэглэлт, дутуу хасалт системийн нэр хүнд алдагдуулна.

**Одоогийн байдал:** Wallet UI бий. Backend wallet transaction суурь байхгүй.

**Хийх зүйл:**

```
supabase/migrations/YYYYMMDD_wallet_transactions.sql:
  - wallet_transactions хүснэгтэд idempotency_key (unique) нэмэх
  - CHECK constraint: amount > 0
  - trigger: wallets.balance автоматаар шинэчлэгдэх

supabase functions (DB RPC):
  CREATE OR REPLACE FUNCTION process_wallet_transaction(
    p_user_id uuid,
    p_type text,         -- 'topup' | 'purchase' | 'refund'
    p_amount numeric,
    p_idempotency_key text,
    p_reference_id uuid DEFAULT NULL
  ) RETURNS json LANGUAGE plpgsql AS $$
  BEGIN
    -- idempotency check (UNIQUE conflict → return existing)
    -- balance check (purchase үед)
    -- insert transaction
    -- update wallet balance (atomic)
  END;
  $$;

src/modules/payment/wallet.ts (шинэ):
  - deductFromWallet(userId, amount, idempotencyKey)
  - topupWallet(userId, amount, idempotencyKey, source)
  - getWalletBalance(userId)

src/app/app/wallet/topup/page.tsx:
  - idempotency_key = crypto.randomUUID() → client-д үүсгэж илгээх

tests/payment/wallet.test.ts:
  - Ижил idempotency_key → нэг л transaction бүртгэгдэх
  - Balance хасалтын дараа зөв үлдэгдэл
```

**Хүлээгдэх үр дүн:** Давхар цэнэглэлт, давхар хасалт 0. Balance consistency 100%.

**Баг:** Backend + DB

---

### 1.3 AUTH-03 — NFC Дижитал Үнэмлэх Flutter

**Яагаад 1-р зэрэглэл вэ?** VIP хэрэглэгчийн нэвтрэлт — интернэтгүйд offline ажиллах ёстой.

**Одоогийн байдал:** QR генераци + HMAC signature веб дээр хийгдсэн (`digital-id.ts`). Flutter NFC байхгүй.

**Хийх зүйл:**

```
flutter/pubspec.yaml:
  - flutter_nfc_kit: ^3.0.0 нэмэх
  - qr_flutter: ^4.1.0 (QR харуулах)
  - local_auth: ^2.1.0 (biometric — 1.3-тай хамт)

flutter/lib/modules/digital_id/:
  digital_id_service.dart:
    - generateQRPayload(userId, role) → HMAC signed JSON
    - verifyPayload(payload, signature) → offline verify
    - refreshTimer: 15 минут бүр payload шинэчлэх

  digital_id_screen.dart:
    - QrImageView widget → payload харуулах
    - NFCWriter: tap хийхэд NDEF record бичих
    - Countdown timer: дараагийн refresh хүртэл

  nfc_scanner.dart (Specialist аппд):
    - NFC tap хүлээн авах
    - Payload decode + HMAC verify (offline)
    - Valid → green ✅, Invalid → red ❌

Вэб (Next.js) — `src/app/admin/users/[id]/digital-id/route.ts`:
  - Existing QR route-д NFC payload-ийн endpoint нэмэх
  - GET /admin/users/[id]/digital-id?format=nfc

tests/flutter/digital_id_test.dart:
  - Offline verify: интернэтгүй payload шалгах
  - Expired payload → reject
  - Tampered signature → reject
```

**Хүлээгдэх үр дүн:** Flutter аппаас NFC tap хийхэд offline verify ажиллана.

**Баг:** Frontend (Flutter) + Backend

---

### 1.4 NOTIF-01 — APNs/FCM Push Notification

**Яагаад 1-р зэрэглэл вэ?** Admin мэдэгдэл, онцгой байдлын broadcast — push байхгүй бол хэрэглэгч мэдэхгүй.

**Одоогийн байдал:** Announcements admin UI + DB бий. Жинхэнэ push байхгүй.

**Хийх зүйл:**

```
src/lib/push/:
  fcm.ts (шинэ):
    - sendPushNotification(tokens[], title, body, data)
    - Firebase Admin SDK ашиглах
    - Batch size: 500 token (FCM limit)

  apns.ts (шинэ):
    - Apple APNs HTTP/2 protocol
    - node-apn эсвэл firebase-admin (unified) ашиглах

supabase/migrations/YYYYMMDD_push_tokens.sql:
  CREATE TABLE push_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    token text NOT NULL,
    platform text CHECK (platform IN ('ios','android','web')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, token)
  );

Flutter:
  flutter/lib/services/push_service.dart:
    - Firebase Messaging setup
    - Token бүртгэх → /api/push/register POST
    - Foreground / background / terminated handler

src/app/api/push/:
  register/route.ts (шинэ):
    - POST: {token, platform} → push_tokens хадгалах
  send/route.ts (шинэ):
    - Admin only endpoint
    - audience шүүлт: all | role | country

src/app/admin/announcements/ шинэчлэлт:
  - "Илгээх" товч → push + DB бичлэг
  - Audience selector: Бүх хэрэглэгч / VIP / Энгийн / Улс
  - Emergency toggle → override хэрэглэгчийн тохиргоог

.env.local нэмэх:
  FIREBASE_PROJECT_ID=
  FIREBASE_PRIVATE_KEY=
  FIREBASE_CLIENT_EMAIL=

tests/push/push-notification.test.ts:
  - Token бүртгэл
  - Audience шүүлт зөв ажиллаж байгаа эсэх
```

**Хүлээгдэх үр дүн:** Admin мэдэгдэл явуулахад бодит push хүрнэ.

**Баг:** Backend + Frontend (Flutter)

---

## SPRINT 2 — Төлбөрийн Систем ба Үйлчилгээний Холболт
### 2 долоо хоног | Зорилго: QPay тест, Shop checkout, Biometric

---

### 2.1 PAY-03 — QPay/SocialPay Sandbox Баталгаажуулалт

**Одоогийн байдал:** `socialpay.ts` + `/api/qpay` route бий. Sandbox тест хийгдэж баталгаажаагүй.

**Хийх зүйл:**

```
.env.local (sandbox тохиргоо):
  SOCIALPAY_BASE_URL=https://sandbox.socialpay.mn
  SOCIALPAY_TOKEN=<sandbox token авах>
  SOCIALPAY_MERCHANT_ID=<merchant ID>
  QPAY_BASE_URL=https://sandbox.qpay.mn/v2
  QPAY_USERNAME=<sandbox>
  QPAY_PASSWORD=<sandbox>

src/modules/payment/qpay.ts (шинэ эсвэл нэмэлт):
  - createQPayInvoice(amount, description, callbackUrl)
  - checkQPayStatus(invoiceId)
  - cancelQPayInvoice(invoiceId)

src/app/api/payment/qpay-callback/route.ts шинэчлэлт:
  - Webhook signature verify
  - Payment status → wallet topup дуудах
  - Idempotency key ашиглан давхар процесслохоос хамгаалах

src/app/app/wallet/topup/page.tsx шинэчлэлт:
  - QPay QR харуулах (QrImageView)
  - SocialPay deeplink товч
  - Polling: 3 секунд тутам status шалгах (max 5 минут)
  - Success → wallet balance refresh

tests/payment/qpay-flow.test.ts:
  - Invoice үүсгэх
  - Callback хүлээн авах + verify
  - Wallet balance шинэчлэгдэх
```

**Хүлээгдэх үр дүн:** QPay/SocialPay-аар wallet цэнэглэх бүрэн ажиллана.

---

### 2.2 SVC-01 — Shop Checkout → Wallet Холболт

**Одоогийн байдал:** Shop UI, cart, orders хуудас бий. Checkout → payment дутуу.

**Хийх зүйл:**

```
src/modules/services/shop-actions.ts (шинэ):
  - addToCart(productId, qty)
  - removeFromCart(cartItemId)
  - checkout(cartItems[]) → deductFromWallet + create order
    * Wallet balance шалгах
    * Atomic: deduct + order create нэг transaction-д
    * idempotency_key = orderId

supabase/migrations/YYYYMMDD_orders.sql:
  - orders хүснэгт: id, user_id, total, status, idempotency_key
  - order_items: order_id, product_id, qty, unit_price
  - products: id, name, price, stock, image_url

src/app/app/services/shop/cart/page.tsx шинэчлэлт:
  - "Худалдан авах" товч → checkout action
  - Wallet balance харуулах
  - Хангалтгүй balance → topup руу чиглүүлэх

src/app/app/services/shop/orders/page.tsx шинэчлэлт:
  - Захиалгын жагсаалт (pending/confirmed/delivered)
  - QR receipt (захиалгын баталгаа)
```

---

### 2.3 AUTH-02 — Flutter Biometric (Face ID / Touch ID)

**Одоогийн байдал:** `local_auth` package Sprint 1.3-т нэмэгдсэн.

**Хийх зүйл:**

```
flutter/lib/modules/auth/biometric_service.dart (шинэ):
  - checkBiometricAvailability() → bool
  - authenticateWithBiometric() → bool
  - Fallback: PIN / нууц үг

flutter/lib/modules/auth/login_screen.dart шинэчлэлт:
  - Аппыг нээхэд biometric prompt харуулах (session байвал)
  - "Биометрийг идэвхжүүлэх" toggle → SharedPreferences-д хадгалах
  - Face ID icon (iOS) / Fingerprint icon (Android)

flutter/lib/modules/profile/security_screen.dart (шинэ):
  - Biometric идэвхжүүлэх/унтраах
  - PIN тохируулах

ios/Runner/Info.plist:
  - NSFaceIDUsageDescription нэмэх
```

---

### 2.4 NOTIF-02 — SMS Монгол Операторуудтай Холболт

**Хийх зүйл:**

```
src/lib/sms/ (шинэ):
  mobicom.ts:
    - sendSMS(phone, message) → Mobicom SMS API
  unitel.ts:
    - sendSMS(phone, message) → Unitel SMS API
  sms-service.ts:
    - sendSMS(phone, message) → provider auto-select (fallback chain)

src/app/api/admin/notify/sms/route.ts (шинэ):
  - Admin only
  - Target: phone number list эсвэл audience шүүлт
  - Rate limit: 100 SMS/min

Supabase хүснэгт:
  - sms_logs: id, phone, message, status, provider, created_at

.env.local:
  SMS_PROVIDER=mobicom   # эсвэл unitel
  MOBICOM_API_KEY=
  MOBICOM_SENDER_ID=
```

---

## SPRINT 3 — Газрын Зураг, Мэдэгдэл, Feedback
### 2 долоо хоног | Зорилго: Map navigation, feedback form, notification improvements

---

### 3.1 MAP-03 — Навигаци (Google Directions API)

**Хийх зүйл:**

```
src/components/map/OutdoorMap.tsx шинэчлэлт:
  - "Замыг харах" товч нэмэх
  - Google Maps Directions API дуудах
  - Алхах / тээврийн хоёр горим

src/app/api/map/directions/route.ts (шинэ):
  - GET ?from={lat,lng}&to={lat,lng}&mode=walking|driving
  - Google Directions API proxy (API key сервер талд)

src/components/map/NavigationPanel.tsx (шинэ):
  - Алхах хугацаа, зайг харуулах
  - Turn-by-turn instructions

.env.local:
  GOOGLE_MAPS_DIRECTIONS_KEY= (server-side only)
```

---

### 3.2 MAP-04 — QR Checkpoint Indoor Navigation

**BLE beacon PoC Sprint 3-т орохгүй (hardware шаардлагатай). QR Checkpoint MVP хийнэ.**

**Хийх зүйл:**

```
supabase/migrations/YYYYMMDD_indoor_checkpoints.sql:
  CREATE TABLE indoor_checkpoints (
    id uuid PRIMARY KEY,
    floor_plan_id uuid REFERENCES floor_plans,
    zone_id uuid REFERENCES indoor_zones,
    label text,
    qr_code text UNIQUE,
    x_percent numeric, y_percent numeric
  );

src/app/api/map/checkpoint/[qrCode]/route.ts (шинэ):
  - GET → checkpoint байршил + ойролцоох POI-уудыг буцаах

flutter/lib/modules/map/checkpoint_scanner.dart (шинэ):
  - QR scan хийхэд /api/map/checkpoint дуудах
  - IndoorMap дээр "Та энд байна" pin харуулах

src/components/map/IndoorMap.tsx шинэчлэлт:
  - currentPosition prop нэмэх
  - "You are here" пин харуулах
```

---

### 3.3 PROG-05 — Санал Асуулга / Feedback Form

**Хийх зүйл:**

```
supabase/migrations/YYYYMMDD_feedback.sql:
  CREATE TABLE session_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid REFERENCES event_sessions,
    user_id uuid REFERENCES auth.users,
    rating int CHECK (rating BETWEEN 1 AND 5),
    comment text,
    is_anonymous boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(session_id, user_id)
  );

src/app/app/programme/[id]/feedback/page.tsx (шинэ):
  - 5 оддын үнэлгээ
  - Нэрийгүй илгээх checkbox
  - Нэг хэрэглэгч нэг л feedback

src/app/admin/programme/[id]/edit/page.tsx шинэчлэлт:
  - Feedback summary харуулах (avg rating, comment тоо)
  - CSV export

Автомат reminder:
  - Арга хэмжаа дууссанаас 1 цагийн дараа push notification
    "Таны feedback-ийг хүлээж байна"
```

---

### 3.4 NOTIF-04 — Emergency Broadcast

**Хийх зүйл:**

```
src/app/admin/announcements/page.tsx шинэчлэлт:
  - Emergency toggle → visual warning + confirm modal
  - "Яаралтай" label + улаан badge

src/lib/push/emergency.ts (шинэ):
  - sendEmergencyBroadcast(title, body):
    1. FCM → бүх iOS/Android токенд (chunked 500)
    2. Supabase Realtime → веб хэрэглэгчдэд
    3. SMS → бүртгэлтэй утасны дугаарт

src/app/app/notifications/page.tsx шинэчлэлт:
  - Emergency мэдэгдлийг дээд талд, улаан banner-тайгаар тусгайлан харуулах
  - Хэрэглэгчийн тохиргоогоор хаах боломжгүй
```

---

## SPRINT 4 — Аюулгүй Байдал, Green Module, Website
### 2 долоо хоног | Зорилго: Security hardening, HealthKit, public website хэсгүүд

---

### 4.1 Admin IP Whitelist (Аюулгүй Байдал)

**Хийх зүйл:**

```
src/middleware.ts шинэчлэлт:
  - /admin/* path-д IP шалгалт нэмэх
  - ADMIN_ALLOWED_IPS env var-аас уншина (comma-separated)
  - Зөвшөөрөгдөөгүй IP → 403 redirect

.env.local:
  ADMIN_ALLOWED_IPS=192.168.1.0/24,10.0.0.0/8

src/app/admin/layout.tsx:
  - IP шалгалтаас гадна session-д admin role шалгах

Rate limiting (нэмэлт хамгаалалт):
  - /api/* endpoint-д rate limit нэмэх (upstash/ratelimit)
  - /auth/* endpoint-д rate limit (OTP abuse хаах)
```

---

### 4.2 GREEN-01 — HealthKit / Health Connect Автомат Интеграци

**Одоогийн байдал:** Manual input бий. Автомат алхам татах байхгүй.

**Хийх зүйл:**

```
flutter/pubspec.yaml:
  - health: ^10.0.0 (HealthKit + Health Connect unified)

flutter/lib/modules/green/health_service.dart (шинэ):
  - requestHealthPermissions() → bool
  - getDailySteps(date) → int
  - syncStepsToServer(steps, date)
  - Background sync: өдөрт нэг удаа автомат явуулах

flutter/lib/modules/green/green_screen.dart шинэчлэлт:
  - "HealthKit-аас автоматаар синхрончлох" toggle
  - Өнөөдрийн алхам автоматаар харагдана
  - Manual input fallback хэвээр үлдэнэ

src/modules/green/actions.ts шинэчлэлт:
  - logSteps RPC: date талбар нэмэх (нэг өдөрт нэг бичлэг)

ios/Runner/Info.plist:
  - NSHealthShareUsageDescription
  - NSHealthUpdateUsageDescription

AndroidManifest.xml:
  - android.permission.health.READ_STEPS
  - android.permission.health.WRITE_STEPS
```

---

### 4.3 GREEN-04 — GDPR Data Retention

**Хийх зүйл:**

```
supabase/migrations/YYYYMMDD_green_retention.sql:
  - step_logs хүснэгтэд retention_until column нэмэх
    DEFAULT: event_end_date + 30 days
  - Scheduled Supabase cron function:
    DELETE FROM step_logs WHERE retention_until < now()

src/app/app/profile/settings/page.tsx (шинэ):
  - "Миний алхалтын өгөгдлийг устгах" товч
  - Confirm modal + immediate delete

src/app/api/user/delete-green-data/route.ts (шинэ):
  - DELETE: зөвхөн өөрийнхөө өгөгдлийг устгах

Privacy policy шинэчлэлт:
  - Алхалтын өгөгдлийн retention хугацааг тодорхойлох
```

---

### 4.4 Public Website — About, News, FAQ хуудсууд

**Хийх зүйл:**

```
src/app/(public)/ шинэчлэлт:
  about/page.tsx (шинэ):
    - Арга хэмжааний тухай ерөнхий мэдээлэл
    - Host country (Монгол) профайл
    - Statistics: оролцогчдын тоо, улсуудын тоо

  news/page.tsx (шинэ):
    - Мэдээний жагсаалт (DB-аас)
    - Хайлт, ангилал шүүлт
    - Pagination

  news/[slug]/page.tsx (шинэ):
    - Дэлгэрэнгүй мэдээ
    - Social share товчлуурууд

  faq/page.tsx (шинэ):
    - Accordion FAQ
    - AI chatbot widget нэгтгэх

src/app/layout.tsx шинэчлэлт:
  - Weather widget (OpenWeatherMap API)
  - Language switcher (MN/EN)

supabase/migrations/YYYYMMDD_news.sql:
  CREATE TABLE news_articles (
    id uuid PRIMARY KEY,
    slug text UNIQUE,
    title_mn text, title_en text,
    body_mn text, body_en text,
    published_at timestamptz,
    is_published boolean DEFAULT false,
    author_id uuid REFERENCES auth.users
  );
```

---

## SPRINT 5 — Үйлчилгээний 3rd Party Холболт
### 2 долоо хоног | Зорилго: Transport, Hotel, Restaurant API холболт

---

### 5.1 SVC-02/03 — Тээвэр ба Нисэх Буудлын Transfer

**Хийх зүйл:**

```
src/modules/services/transport/:
  transport-provider.ts (interface):
    interface TransportProvider {
      searchRides(from, to, datetime): Promise<RideOption[]>
      bookRide(option, userId): Promise<Booking>
      cancelBooking(bookingId): Promise<void>
    }

  uber.ts / grab.ts / local-taxi.ts:
    - Provider бүрийн API wrapper
    - Fallback chain: Uber → Grab → local taxi

  airport-transfer.ts:
    - FlightAware/AviationStack API → нислэгийн мэдээлэл авах
    - Transfer захиалга: flight number + arrival time input

src/app/app/services/transport/page.tsx шинэчлэлт:
  - Хэрэглэгч байршлаас → хурлын талбай хүртэл
  - Үнийн жагсаалт харуулах
  - Захиалах → wallet-аас хасах

.env.local:
  AVIATION_STACK_API_KEY=
  UBER_SERVER_TOKEN=
```

---

### 5.2 SVC-04 — Ресторан Захиалга

**Хийх зүйл:**

```
supabase/migrations/YYYYMMDD_restaurant.sql:
  CREATE TABLE restaurants (
    id uuid, name text, cuisine text, 
    opening_hours jsonb, location_zone text
  );
  CREATE TABLE restaurant_bookings (
    id uuid, restaurant_id uuid, user_id uuid,
    booking_time timestamptz, party_size int,
    status text, qr_code text UNIQUE
  );

src/app/app/services/restaurant/page.tsx шинэчлэлт:
  - Ресторан жагсаалт (cuisine ангиллаар)
  - "Захиалах" → time picker + party size
  - QR receipt → нэвтрэх үед scan

src/app/api/restaurant/book/route.ts (шинэ):
  - Давхар захиалга хаах (time slot conflict check)
  - QR code үүсгэх (HMAC signed)
```

---

### 5.3 SVC-08 — Vendor KYC Процесс

**Хийх зүйл:**

```
supabase/migrations/YYYYMMDD_vendor_kyc.sql:
  ALTER TABLE vendors ADD COLUMN
    registration_doc_url text,
    tax_id text,
    kyc_status text DEFAULT 'pending'
    CHECK (kyc_status IN ('pending','approved','rejected'));

src/app/admin/vendors/ шинэчлэлт:
  - KYC баримт бичиг харах (PDF viewer)
  - Approve/Reject товч + шалтгааны тайлбар
  - Email мэдэгдэл автоматаар явуулах

src/app/(dashboard)/vendor-apply/ (шинэ):
  - Vendor бүртгэлийн маягт
  - Баримт бичиг upload (Supabase Storage)
  - KYC статус харах
```

---

## SPRINT 6 — Эцсийн Шинэчлэлт, Performance, Release
### 2 долоо хоног | Зорилго: Load test, GDPR, staging, soft launch бэлтгэл

---

### 6.1 Performance & Load Testing

**Хийх зүйл:**

```
k6 load tests/:
  tests/load/seat-registration.js:
    - 10,000 virtual users → registerForSession
    - Success rate ≥ 99%, response time ≤ 3s

  tests/load/wallet-topup.js:
    - 5,000 VU → concurrent topup
    - Idempotency verify

  tests/load/api-general.js:
    - Mixed traffic: programme, map, chat, services
    - P95 response time ≤ 2s

Supabase тохиргоо:
  - Connection pooling (PgBouncer) идэвхжүүлэх
  - Index шинжилгээ: slow query log харах
  - Partition: audit_log, chat_messages → date-д тулгуурласан partition
```

---

### 6.2 GDPR Compliance

**Хийх зүйл:**

```
src/app/app/profile/settings/page.tsx шинэчлэлт:
  - "Миний бүх өгөгдлийг татаж авах" (data export)
  - "Бүртгэлээ устгах" (account deletion)

src/app/api/user/export/route.ts (шинэ):
  - Хэрэглэгчийн бүх өгөгдлийг JSON-оор буцаах
  - Rate limit: 1 request/day

src/app/api/user/delete-account/route.ts (шинэ):
  - auth.users soft delete
  - 30 хоногийн дараа бүрэн устгах (cron)
  - PII anonymization: нэр, и-мэйл → хасах

src/app/(auth)/login/ шинэчлэлт:
  - Cookie consent banner
  - Privacy policy зөвшөөрөх checkbox (шинэ хэрэглэгчдэд)
```

---

### 6.3 Staging Орчин

**Хийх зүйл:**

```
Vercel:
  - Preview deployment → staging.event-app.mn domain
  - Production-тай ижил env vars (sandbox API keys)

Supabase:
  - Staging project үүсгэх: event-app-staging
  - Migration sync: production-тай ижил schema

GitHub Actions / Vercel CI:
  .github/workflows/ci.yml:
    - PR үүсгэхэд: vitest run, build check
    - main branch merge → auto staging deploy
    - Tag v*.*.* → production deploy (manual approve)
```

---

### 6.4 NOTIF-05 — Автомат Орчуулга

**Хийх зүйл:**

```
src/lib/translation.ts (шинэ):
  - translateText(text, from, to) → OpenAI / DeepL API
  - Cache: ижил текстийг дахин орчуулахгүй (Redis / DB cache)

src/app/admin/announcements/page.tsx шинэчлэлт:
  - Монгол хэлээр бичихэд автоматаар Англи орчуулга харуулах
  - "Орчуулга засах" inline editor

.env.local:
  TRANSLATION_PROVIDER=openai   # эсвэл deepl
  DEEPL_API_KEY=
```

---

## ХЭРЭГЖҮҮЛЭХГҮЙ (External Dependency)

Дараах хэсгүүд нь гадаад нөхцөл байдлаас хамааралтай бөгөөд хөгжүүлэлтийн хуваарьт оруулахгүй. Гэрээ, хэлэлцээр дуусмагц нэмнэ.

| ID | Шаардлага | Шалтгаан |
|---|---|---|
| SVC-06 | E-SIM худалдан авалт | Монгол оператортой гэрээ хэрэгтэй (Mobicom/Unitel) |
| MAP-04 BLE | BLE Beacon | Hardware суурилуулалт — талбайн зөвшөөрөл + тендер |
| PAY-02 | Банкны карт (Visa/MC) | PCI-DSS audit + bank agreement |
| PAY-04 | iOS/Android In-App Purchase | App Store / Play Store review process |
| K8s | Docker/Kubernetes | NDC MCloud орчин → DevOps тусдаа ажил |

---

## SPRINT ХУВААРИЙН ХҮСНЭГТ

| Sprint | Хугацаа | Голлох ажлууд | Баг |
|---|---|---|---|
| S1 | W1-W2 | Race condition, Wallet ACID, NFC PoC, Push setup | BE + DB + Flutter |
| S2 | W3-W4 | QPay sandbox, Shop checkout, Biometric, SMS | BE + Flutter + FE |
| S3 | W5-W6 | Navigation, Indoor QR, Feedback, Emergency broadcast | BE + FE + Flutter |
| S4 | W7-W8 | IP whitelist, HealthKit, GDPR delete, Public website | BE + FE + Flutter |
| S5 | W9-W10 | Transport/Hotel/Restaurant API, Vendor KYC | BE + FE |
| S6 | W11-W12 | Load test, GDPR full, Staging, Translation, Soft launch | QA + BE + DevOps |

---

## БАGИЙН ХАРИУЦЛАГА

| Баг | Sprint 1 | Sprint 2 | Sprint 3 |
|---|---|---|---|
| 🎨 Frontend | Wallet UI idempotency, Admin push UI | Shop checkout UI | Map navigation UI, Feedback form |
| ⚙️ Backend | Wallet RPC, Push API, QPay webhook | QPay/SocialPay test, SMS API | Directions API proxy, Emergency broadcast |
| 🗄️ DB | Seat lock RPC, Wallet transaction | Orders schema, push_tokens | Feedback schema, indoor checkpoints |
| 📱 Flutter | NFC digital ID, Push SDK | Biometric auth | QR checkpoint scanner, HealthKit |
| ✅ QA | Race condition load test | Payment flow E2E | Notification delivery test |
| 🖌️ UX/UI | Wallet flow, Digital ID screen | Shop checkout UX | Feedback form UX |

---

*Сүүлчийн шинэчлэл: 2026-03-30 | Дараагийн review: Sprint 1 дууссаны дараа*
