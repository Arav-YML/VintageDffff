# ⚡ Quick Start Guide

## For GitHub Users (Recommended)

### Step 1: Upload to GitHub

```bash
# Extract the archive
tar -xzf vintage_pdf_apk_build_github.tar.gz
cd vintage_pdf_apk_build_github

# Initialize Git
git init
git add .
git commit -m "Initial commit: Vintage PDF Generator"

# Create new repo on GitHub, then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vintage-pdf-generator.git
git push -u origin main
```

### Step 2: Wait for Build

1. Go to your GitHub repository
2. Click on **"Actions"** tab
3. Watch the build progress (takes ~10-15 minutes)
4. ✅ Build completes automatically!

### Step 3: Download APK

1. In the **Actions** tab, click on the completed workflow
2. Scroll down to **"Artifacts"**
3. Download:
   - `vintage-pdf-debug-apk.zip` (for testing)
   - `vintage-pdf-release-apk.zip` (for distribution)
4. Extract and install the APK on your Android device

## For Local Builds

### Prerequisites

- Node.js 18+
- Java JDK 17
- Android SDK (API 35)

### Build Commands

```bash
# Extract archive
tar -xzf vintage_pdf_apk_build_github.tar.gz
cd vintage_pdf_apk_build_github

# Install dependencies
yarn install

# Link icon fonts
mkdir -p android/app/src/main/assets/fonts
cp node_modules/react-native-vector-icons/Fonts/*.ttf android/app/src/main/assets/fonts/

# Generate keystore
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore debug.keystore \
  -storepass android -alias androiddebugkey -keypass android \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Android Debug,O=Android,C=US"
cd ../..

# Build APK
cd android
./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 📱 Installing APK

### On Physical Device

1. Enable **"Unknown Sources"** in Android settings
2. Transfer APK to device
3. Tap APK file to install

### Via ADB

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 🎯 What's Included

✅ Complete Android native project structure
✅ Pure React Native (NO Expo)
✅ GitHub Actions workflow for automated builds
✅ All dependencies configured
✅ Ready to build APK

## ⚙️ Build Outputs

| Build Type | Location | Purpose |
|------------|----------|----------|
| Debug APK | `android/app/build/outputs/apk/debug/` | Testing & Development |
| Release APK | `android/app/build/outputs/apk/release/` | Distribution |

## 🔥 Common Issues

### "SDK not found"

Install Android SDK and set environment variables:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### "Permission denied: gradlew"

```bash
chmod +x android/gradlew
```

### "Icon fonts not found"

```bash
mkdir -p android/app/src/main/assets/fonts
cp node_modules/react-native-vector-icons/Fonts/*.ttf android/app/src/main/assets/fonts/
```

## 📖 Full Documentation

See [README.md](./README.md) for complete documentation.

## 🎉 Success!

Your app should now be building! 🚀

For GitHub Actions builds, check the **Actions** tab after pushing to GitHub.
