# SaaS Base — Flutter Scaffold

Ямар ч SaaS мобайл апп-д дахин ашиглах боломжтой Flutter суурь scaffold.

## Stack

| Технологи | Хувилбар | Зориулалт |
|-----------|---------|-----------|
| Flutter | ≥3.0 | UI framework |
| supabase_flutter | ^2.3.0 | Auth + DB |
| go_router | ^13.0.0 | Navigation |
| flutter_riverpod | ^2.5.0 | State management |
| shared_preferences | ^2.2.0 | Local storage |
| envied | ^0.5.0 | Env vars |

---

## Эхлүүлэх

### 1. Flutter суулгах

```bash
# Flutter SDK суулгаагүй бол:
# https://docs.flutter.dev/get-started/install
flutter --version
```

### 2. Supabase тохируулах

1. [supabase.com](https://supabase.com)-д шинэ проект үүсгэх
2. `.env.example`-ийг `.env` болгон хуулах:

```bash
cp .env.example .env
```

3. `.env` файлд утга оруулах:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. Supabase Schema

Суpabase SQL Editor-т дараах SQL-ийг ажиллуулах:

```sql
-- Organizations
create table organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  logo_url text,
  created_at timestamptz default now()
);

-- Organization members
create table organization_members (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member',
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

-- Plans
create table plans (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price_monthly numeric default 0,
  limits jsonb default '{}'
);

-- Subscriptions
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade,
  plan_id uuid references plans(id),
  status text default 'trialing',
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- RLS
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table subscriptions enable row level security;

-- Policies
create policy "Members can view their org"
  on organizations for select
  using (id in (
    select org_id from organization_members where user_id = auth.uid()
  ));

create policy "Members can view membership"
  on organization_members for select
  using (user_id = auth.uid());

create policy "Members can view subscription"
  on subscriptions for select
  using (org_id in (
    select org_id from organization_members where user_id = auth.uid()
  ));
```

### 4. Dependencies суулгах

```bash
flutter pub get
```

### 5. Code generation (Riverpod)

```bash
dart run build_runner build --delete-conflicting-outputs
```

### 6. Ажиллуулах

```bash
# Env vars-ийг dart-define-аар дамжуулах
flutter run \
  --dart-define=SUPABASE_URL=https://xxxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Шинэ SaaS-д Customize хийх

### Алхам 1: App нэр өөрчлөх

- `pubspec.yaml` → `name:` болон `description:` өөрчлөх
- `lib/main.dart` → `title: 'SaaS Base'` → өөрийн нэр
- `android/app/src/main/AndroidManifest.xml` → `android:label`
- `ios/Runner/Info.plist` → `CFBundleName`

### Алхам 2: Theme тохируулах

`lib/core/theme/app_theme.dart` дотор:
```dart
static const _primaryColor = Color(0xFF6366F1); // ← өөрийн өнгө
```

### Алхам 3: Home screen-д domain content нэмэх

`lib/features/home/screens/home_screen.dart` дотор `PlaceholderContent` widget-ийг domain-specific widget-ээр солих.

### Алхам 4: Шинэ feature нэмэх

```
lib/features/your_feature/
├── screens/
│   └── your_screen.dart
└── providers/
    └── your_provider.dart
```

`app_router.dart`-д route нэмэх:
```dart
GoRoute(
  path: '/your-feature',
  builder: (_, __) => const YourScreen(),
),
```

### Алхам 5: Supabase table нэмэх

1. Supabase dashboard-д table үүсгэх
2. `lib/shared/models/` дотор model нэмэх
3. Provider-д fetch logic бичих

---

## Файлын бүтэц

```
lib/
├── main.dart                    # Entry point, Supabase init
├── core/
│   ├── supabase/                # Supabase client singleton
│   ├── router/                  # go_router + redirect logic
│   └── theme/                   # Material3 light/dark theme
├── features/
│   ├── auth/                    # OTP login + verify
│   ├── organization/            # Org setup + info
│   ├── subscription/            # Plan + billing
│   └── home/                    # Generic dashboard
└── shared/
    ├── widgets/                 # Reusable UI components
    └── models/                  # Data models
```

---

## Auth Flow

```
/login → email → sendOtp()
  ↓
/verify → token → verifyOtp()
  ↓
[org байхгүй?] → /setup-org → createOrg()
  ↓
/home
```

---

## Тэмдэглэл

- `envied` package ашиглан `.env` файлыг compile-time constants болгох боломжтой (security сайн)
- `shared_preferences` нь offline state хадгалахад ашиглагдана
- RLS (Row Level Security) Supabase-д заавал идэвхжүүлэх
- Production-д Supabase URL/key-г CI/CD env vars-аар дамжуулах
