# REPO_STRUCTURE.md — Репозиторийн Бүтэц

## Одоогийн байдал (2026-03-27)

```
Saas System base/           ← root
├── src/                    ← Next.js source (app, components, modules, lib)
├── supabase/               ← migrations, seeds, config ✅
├── flutter/                ← Flutter mobile app ✅
├── scripts/                ← utility scripts
├── docs/                   ← architecture, billing, ops docs
├── tests/                  ← e2e, integration, unit
├── package.json            ← Next.js root (name: martech-mvp)
├── next.config.ts
├── middleware.ts
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.mjs
├── .env.example
├── .env.local
├── SAAS_BASE_README.md
└── README.md
```

**Асуудал:** Next.js файлууд (`src/`, `package.json`, `next.config.ts` г.м) root-т байгаа учраас `web/` subdirectory байхгүй байна.

---

## Зорилтот бүтэц

```
saas-base/
├── web/                    ← Next.js бүгд (src/, package.json, next.config.ts, middleware.ts гэх мэт)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── modules/
│   │   ├── lib/
│   │   └── types/
│   ├── package.json
│   ├── next.config.ts
│   ├── middleware.ts
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── eslint.config.mjs
│   └── .env.example
├── flutter/                ← Flutter mobile app (одоо байгаагаар ✅)
│   ├── lib/
│   ├── pubspec.yaml
│   └── .env.example
├── supabase/               ← migrations, seeds, config (одоо байгаагаар ✅)
│   ├── migrations/
│   ├── seeds/
│   └── config.toml
├── scripts/                ← clone болон utility scripts
│   └── new-saas.sh
├── docs/                   ← баримт бичиг
├── tests/                  ← тест
├── SAAS_BASE_README.md
└── .gitignore
```

---

## Restructure хийх алхмууд

> ⚠️ **АНХААРУУЛГА:** iCloud Drive дээр байгаа учраас файл зөөхдөө болгоомжтой байх хэрэгтэй.
> `mv` командыг ашиглахаас өмнө iCloud sync дууссан эсэхийг шалгана уу.

### 1. web/ folder үүсгэж Next.js файлуудыг зөөх

```bash
# Төслийн root-оос ажиллуулах
BASE="/Users/marktech/Library/Mobile Documents/com~apple~CloudDocs/Documents/Saas System base"

mkdir -p "$BASE/web"

# Next.js файлуудыг web/ руу зөөх
mv "$BASE/src"                 "$BASE/web/src"
mv "$BASE/package.json"        "$BASE/web/package.json"
mv "$BASE/package-lock.json"   "$BASE/web/package-lock.json"
mv "$BASE/next.config.ts"      "$BASE/web/next.config.ts"
mv "$BASE/next-env.d.ts"       "$BASE/web/next-env.d.ts"
mv "$BASE/middleware.ts"       "$BASE/web/middleware.ts"
mv "$BASE/tsconfig.json"       "$BASE/web/tsconfig.json"
mv "$BASE/tsconfig.tsbuildinfo" "$BASE/web/tsconfig.tsbuildinfo"
mv "$BASE/vitest.config.ts"    "$BASE/web/vitest.config.ts"
mv "$BASE/eslint.config.mjs"   "$BASE/web/eslint.config.mjs"
mv "$BASE/.env.example"        "$BASE/web/.env.example"
mv "$BASE/node_modules"        "$BASE/web/node_modules"
```

### 2. Нэр солих

```bash
# package.json дотор нэр солих
sed -i '' 's/"name": "martech-mvp"/"name": "saas-base"/' "$BASE/web/package.json"

# flutter/pubspec.yaml дотор нэр солих
sed -i '' 's/^name:.*/name: saas_base/' "$BASE/flutter/pubspec.yaml"
```

### 3. Root-т .env.example нэмэх (optional)

Root-т `.env.example` байлгахгүй ч болно — `web/.env.example` л хангалттай.

### 4. Vercel config шинэчлэх

`.vercel/project.json` болон Vercel dashboard-д `rootDirectory: web` тохируулах.

### 5. GitHub Actions шинэчлэх

`.github/workflows/ci.yml` дотор `working-directory: web` нэмэх.

---

## Хамаарал

| Tool       | Config файл                  | Шинэчлэх зүйл              |
|------------|------------------------------|----------------------------|
| Vercel     | `.vercel/project.json`       | `rootDirectory: "web"`     |
| GitHub CI  | `.github/workflows/ci.yml`   | `working-directory: web`   |
| Supabase   | `supabase/config.toml`       | өөрчлөлт хэрэггүй          |
| Flutter    | `flutter/pubspec.yaml`       | нэр солих                  |

---

*Үүсгэсэн: 2026-03-27 | Backend Agent*
