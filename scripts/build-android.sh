#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Android Build Setup..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Build Web App
echo "🏗️ Building Web App..."
npm run build

# 3. Add Android Platform if missing
if [ ! -d "android" ]; then
  echo "📱 Adding Android platform..."
  npx cap add android
else
  echo "✅ Android platform already exists."
fi

# 4. Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# 5. Fix gradlew permissions
echo "🔐 Fixing gradlew permissions..."
if [ -f "android/gradlew" ]; then
  chmod +x android/gradlew
fi

# 6. Build Android APK
echo "🤖 Building Android APK..."
cd android
./gradlew assembleDebug

echo "🎉 Build completed successfully!"
