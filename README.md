# Vintage PDF Generator - Android Native Build

![Platform](https://img.shields.io/badge/platform-Android-green.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

A React Native Android app that transforms markdown-formatted text files into beautifully styled vintage textbook PDFs.

## 📱 Features

- ✨ **Vintage Textbook Styling** - Classic typography with decorative borders
- 📚 **Automatic Table of Contents** - Generated from chapter headers
- 📄 **Smart Formatting** - Supports chapters, sections, bullets, and bold text
- 📊 **Document Statistics** - View line, chapter, section, and bullet counts
- 💾 **On-Device PDF Generation** - No internet required
- 📤 **Easy Sharing** - Save or share PDFs directly from the app

## 🏗️ Architecture

This is a **pure React Native** Android project with **NO Expo dependencies**. 

### Technology Stack
- **React Native 0.79.5** - Core framework
- **TypeScript** - Type safety
- **Gradle 8.11.1** - Build system
- **Kotlin** - Native Android code
- **Min SDK 24** - Android 7.0+
- **Target SDK 35** - Android 15

### Native Dependencies
- `react-native-document-picker` - File selection
- `react-native-fs` - File system operations
- `react-native-share` - Sharing functionality
- `react-native-vector-icons` - Icons
- `react-native-html-to-pdf` - PDF generation

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18
- **Yarn** package manager
- **Java JDK 17**
- **Android SDK** (API 35)
- **Android NDK 27.2.12479018**

### Local Development Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd vintage_pdf_apk_build_github

# 2. Install dependencies
yarn install

# 3. Link vector icon fonts
mkdir -p android/app/src/main/assets/fonts
cp node_modules/react-native-vector-icons/Fonts/*.ttf android/app/src/main/assets/fonts/

# 4. Generate debug keystore (if not exists)
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore debug.keystore \
  -storepass android -alias androiddebugkey -keypass android \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Android Debug,O=Android,C=US"
cd ../..

# 5. Build APK
cd android
./gradlew assembleDebug    # For debug build
./gradlew assembleRelease  # For release build
cd ..
```

### Output Location

- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

## 🤖 GitHub Actions - Automated Build

This project includes a GitHub Actions workflow that automatically builds APKs on every push.

### Setup Instructions

1. **Upload to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Vintage PDF Generator"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Automatic Build**:
   - GitHub Actions will automatically trigger on push
   - Build takes ~10-15 minutes
   - APKs are saved as artifacts for 30 days (debug) / 90 days (release)

3. **Download APKs**:
   - Go to **Actions** tab in your GitHub repo
   - Click on the latest workflow run
   - Scroll down to **Artifacts**
   - Download `vintage-pdf-debug-apk` or `vintage-pdf-release-apk`

### Manual Trigger

You can also manually trigger builds:
1. Go to **Actions** tab
2. Select **Build Android APK** workflow
3. Click **Run workflow**

## 📦 Building Locally

### Debug Build

```bash
cd android
./gradlew assembleDebug
```

### Release Build

```bash
cd android
./gradlew assembleRelease
```

### Install on Device

```bash
# Via ADB
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or using Gradle
cd android
./gradlew installDebug
```

## 📝 Markdown Format Guide

The app converts markdown-style text files into PDFs:

```markdown
# Document Title
Main title shown on cover page

## Chapter 1: Introduction
Chapter headers create new pages with large numbering

### Section Title
Sections within chapters

* Bullet point 1
* Bullet point 2
* **Bold text** in bullets

Regular paragraph text with **bold formatting**.
```

## 🏛️ Project Structure

```
vintage_pdf_apk_build_github/
├── .github/
│   └── workflows/
│       └── build-apk.yml          # GitHub Actions workflow
├── android/                        # Native Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/vintagepdf/generator/
│   │   │   │   ├── MainActivity.kt
│   │   │   │   └── MainApplication.kt
│   │   │   ├── res/               # Android resources
│   │   │   └── AndroidManifest.xml
│   │   ├── build.gradle           # App-level Gradle config
│   │   └── debug.keystore         # Debug signing key
│   ├── gradle/                    # Gradle wrapper
│   ├── build.gradle               # Project-level Gradle config
│   ├── settings.gradle
│   └── gradle.properties
├── app/
│   └── index.tsx                  # Main React Native app
├── assets/
│   ├── fonts/
│   └── images/
├── index.js                       # React Native entry point
├── package.json                   # Dependencies (NO Expo)
├── babel.config.js
├── metro.config.js
├── tsconfig.json
└── README.md
```

## 🔧 Troubleshooting

### Build Fails with "SDK not found"

Make sure Android SDK is installed:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Gradlew Permission Denied

```bash
cd android
chmod +x ./gradlew
```

### Missing Vector Icon Fonts

```bash
mkdir -p android/app/src/main/assets/fonts
cp node_modules/react-native-vector-icons/Fonts/*.ttf android/app/src/main/assets/fonts/
```

### Clean Build

```bash
cd android
./gradlew clean
./gradlew assembleDebug --no-daemon --stacktrace
```

## 🎨 Customization

### Change App Name

Edit `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Your App Name</string>
```

### Change Package Name

1. Update `android/app/build.gradle`:
   ```gradle
   applicationId "com.yourcompany.yourapp"
   ```

2. Update `android/app/src/main/AndroidManifest.xml`

3. Rename directory structure under `android/app/src/main/java/`

### Change App Icon

Replace icons in `android/app/src/main/res/mipmap-*/`

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Check troubleshooting section above

## 🔗 Related Resources

- [React Native Documentation](https://reactnative.dev/)
- [Android Developer Guide](https://developer.android.com/)
- [Gradle Build Tool](https://gradle.org/)

---

**Made with ❤️ using React Native**
