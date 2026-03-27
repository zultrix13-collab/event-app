#!/bin/bash
# new-saas.sh — SaaS Base-аас шинэ төсөл үүсгэх
#
# Хэрэглэх:
#   ./scripts/new-saas.sh <project-name>
#
# Жишээ:
#   ./scripts/new-saas.sh my-new-saas

set -e

PROJECT_NAME=$1
if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: ./scripts/new-saas.sh <project-name>"
  echo ""
  echo "Жишээ:"
  echo "  ./scripts/new-saas.sh my-new-saas"
  exit 1
fi

# project-name хүчинтэй эсэхийг шалгах (зөвхөн lowercase, тоо, dash)
if [[ ! "$PROJECT_NAME" =~ ^[a-z0-9-]+$ ]]; then
  echo "❌ Project name зөвхөн lowercase үсэг, тоо, dash (-) агуулах ёстой."
  echo "   Жишээ: my-new-saas"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
DEST_DIR="$HOME/Projects/$PROJECT_NAME"

echo "🚀 Шинэ SaaS төсөл үүсгэж байна: $PROJECT_NAME"
echo "📁 Эх сурвалж: $BASE_DIR"
echo "📁 Зорилтот зам: $DEST_DIR"
echo ""

# Аль хэдийн байгаа эсэхийг шалгах
if [ -d "$DEST_DIR" ]; then
  echo "❌ $DEST_DIR аль хэдийн байна. Өөр нэр сонгоно уу."
  exit 1
fi

# ~/Projects folder байхгүй бол үүсгэх
mkdir -p "$HOME/Projects"

# ── 1. Copy ──────────────────────────────────────────────────
echo "📋 Файлуудыг хуулж байна..."
cp -r "$BASE_DIR" "$DEST_DIR"

# ── 2. Template-only файлуудыг устгах ───────────────────────
echo "🧹 Template файлуудыг цэвэрлэж байна..."
rm -f  "$DEST_DIR/SAAS_BASE_README.md"
rm -f  "$DEST_DIR/REPO_STRUCTURE.md"
rm -f  "$DEST_DIR/scripts/new-saas.sh"
rm -rf "$DEST_DIR/.git"
rm -rf "$DEST_DIR/.vercel"
rm -f  "$DEST_DIR/.env.local"

# node_modules хуулагдсан бол устгах (npm install дахин ажиллуулна)
rm -rf "$DEST_DIR/web/node_modules" 2>/dev/null || true
rm -f  "$DEST_DIR/web/tsconfig.tsbuildinfo" 2>/dev/null || true
# Flutter build artifacts
rm -rf "$DEST_DIR/flutter/.dart_tool" 2>/dev/null || true
rm -rf "$DEST_DIR/flutter/build" 2>/dev/null || true

# supabase temp files
rm -rf "$DEST_DIR/supabase/.temp" 2>/dev/null || true

# ── 3. Project нэр солих ─────────────────────────────────────
echo "✏️  Project нэрийг тохируулж байна..."

# web/package.json — name солих
if [ -f "$DEST_DIR/web/package.json" ]; then
  sed -i '' "s/\"name\": \"[^\"]*\"/\"name\": \"$PROJECT_NAME\"/" \
    "$DEST_DIR/web/package.json"
  echo "   ✓ web/package.json"
elif [ -f "$DEST_DIR/package.json" ]; then
  # restructure хийгдээгүй тохиолдолд root-аас хайх
  sed -i '' "s/\"name\": \"[^\"]*\"/\"name\": \"$PROJECT_NAME\"/" \
    "$DEST_DIR/package.json"
  echo "   ✓ package.json"
fi

# flutter/pubspec.yaml — name солих (underscore хэрэглэнэ)
FLUTTER_NAME="${PROJECT_NAME//-/_}"
if [ -f "$DEST_DIR/flutter/pubspec.yaml" ]; then
  sed -i '' "s/^name: .*/name: $FLUTTER_NAME/" \
    "$DEST_DIR/flutter/pubspec.yaml"
  echo "   ✓ flutter/pubspec.yaml (name: $FLUTTER_NAME)"
fi

# ── 4. Git init ──────────────────────────────────────────────
echo "🔧 Git repository эхлүүлж байна..."
cd "$DEST_DIR"
git init -q
git add .
git commit -q -m "chore: init $PROJECT_NAME from saas-base template"
echo "   ✓ git init + initial commit"

# ── 5. Дуусгавар ─────────────────────────────────────────────
echo ""
echo "✅ Төсөл үүслээ: $DEST_DIR"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Дараагийн алхамууд:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# web/ эсвэл root-д package.json байгааг шалгаж зөв замыг харуулах
if [ -d "$DEST_DIR/web" ]; then
  WEB_DIR="$DEST_DIR/web"
else
  WEB_DIR="$DEST_DIR"
fi

echo ""
echo "  1. Web тохируулах:"
echo "       cd $WEB_DIR"
echo "       cp .env.example .env.local"
echo "       # .env.local дотор Supabase болон QPay vars бөглөх"
echo "       npm install"
echo "       npm run dev"
echo ""
echo "  2. Supabase migrations ажиллуулах:"
echo "       cd $DEST_DIR/supabase"
echo "       supabase db push"
echo "       # эсвэл migrations-г Supabase dashboard-аас гараар ажиллуулах"
echo ""
echo "  3. Flutter тохируулах:"
echo "       cd $DEST_DIR/flutter"
echo "       flutter pub get"
echo "       # flutter/.env.example → flutter/.env"
echo ""
echo "  4. Admin тохируулах:"
echo "       INTERNAL_OPS_EMAILS=you@example.com  (.env.local)"
echo "       /admin хуудаснаас bootstrap хийх"
echo ""
echo "  📖 Дэлгэрэнгүй: $BASE_DIR/SAAS_BASE_README.md"
echo ""
