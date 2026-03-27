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

# Check if the wrapper JAR is valid (contains the main class)
if ! grep -q "GradleWrapperMain" android/gradle/wrapper/gradle-wrapper.jar 2>/dev/null; then
  echo "⚠️ Gradle wrapper JAR appears corrupted or missing classes. Attempting to regenerate..."
  # Removing and re-adding the android platform is the most reliable way to restore the wrapper
  rm -rf android
  npx cap add android
  npx cap sync android
  chmod +x android/gradlew
fi

# Using java directly with the wrapper JAR to avoid script-related classpath issues
JAVACMD="java"
if [ -n "$JAVA_HOME" ]; then
  JAVACMD="$JAVA_HOME/bin/java"
fi

echo "☕ Using Java: $JAVACMD"
$JAVACMD -cp android/gradle/wrapper/gradle-wrapper.jar org.gradle.wrapper.GradleWrapperMain -p android assembleDebug

echo "🎉 Build completed successfully!"
