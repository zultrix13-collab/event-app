#!/bin/bash
XCCONFIG="ios/Flutter/Generated.xcconfig"
if [ -f "$XCCONFIG" ]; then
  sed -i '' 's/EXCLUDED_ARCHS\[sdk=iphonesimulator\*\]=i386 arm64/EXCLUDED_ARCHS[sdk=iphonesimulator*]=i386/' "$XCCONFIG"
  echo "✅ Fixed Generated.xcconfig — arm64 removed from excluded"
fi
