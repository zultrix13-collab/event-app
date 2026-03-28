#!/bin/bash
# Pre-deployment validation script
echo "🔍 Event App — Deploy Check"
echo ""

# Check required env vars
required_vars=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "NEXT_PUBLIC_APP_URL"
  "QPAY_CLIENT_ID"
)

all_ok=true
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing: $var"
    all_ok=false
  else
    echo "✅ $var"
  fi
done

echo ""
if [ "$all_ok" = true ]; then
  echo "✅ All required env vars present"
  echo "🚀 Ready to deploy!"
else
  echo "❌ Fix missing env vars before deploying"
  exit 1
fi
