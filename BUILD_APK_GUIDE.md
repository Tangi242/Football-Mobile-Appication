# APK Build Guide for NamFootball Hub

## Quick Start

The easiest way to build an APK is using EAS Build (Expo's cloud build service).

### Step 1: Create Expo Account (Free)
Visit https://expo.dev/signup and create a free account.

### Step 2: Login
```bash
npx eas-cli login
```

### Step 3: Build APK
```bash
cd c:\wamp64\www\NFA
npx eas-cli build --platform android --profile preview
```

### Step 4: Download APK
After build completes (10-20 minutes), download the APK from the provided link or from your Expo dashboard.

### Step 5: Copy to Desktop
Copy the downloaded APK file to: `C:\Users\KTCC\Desktop\NamFootball_Hub.apk`

## Alternative: Local Build

If you prefer to build locally:

1. **Install Prerequisites:**
   - Android Studio
   - Java JDK
   - Android SDK

2. **Generate Android Project:**
   ```bash
   cd c:\wamp64\www\NFA
   npx expo prebuild --platform android
   ```

3. **Open in Android Studio:**
   - Open Android Studio
   - File > Open > Select the `android` folder

4. **Build APK:**
   - Build > Build Bundle(s) / APK(s) > Build APK(s)
   - APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

5. **Copy to Desktop:**
   ```bash
   copy android\app\build\outputs\apk\debug\app-debug.apk C:\Users\KTCC\Desktop\NamFootball_Hub.apk
   ```

## Configuration

The project is already configured with:
- ✅ `eas.json` - EAS Build configuration
- ✅ `app.json` - App configuration with Android package name
- ✅ Android permissions configured

## Notes

- The APK will connect to your backend API
- Make sure your backend server is running
- Update API URLs in production builds
- All test users have password: `Password123`

