# Android SDK Setup Instructions

## Problem
You're getting the error: "Error fetching your Android emulators! Make sure your path is correct."

## Solution - Step by Step

### Step 1: Verify Android SDK Installation
Your Android SDK is located at: `C:\Users\KTCC\AppData\Local\Android\Sdk`

✅ **Verified**: Android SDK is installed and found.

### Step 2: Set Environment Variables (Choose one method)

#### Method A: Using PowerShell Script (Recommended)
1. Open PowerShell as Administrator (Right-click → Run as Administrator)
2. Navigate to your project directory:
   ```powershell
   cd C:\wamp64\www\NFA
   ```
3. Run the setup script:
   ```powershell
   .\setup-android-env.ps1
   ```

#### Method B: Manual Setup via System Properties
1. Press `Win + Pause` to open System Properties
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "User variables", click "New" and add:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\KTCC\AppData\Local\Android\Sdk`
5. Click "New" again and add:
   - Variable name: `ANDROID_SDK_ROOT`
   - Variable value: `C:\Users\KTCC\AppData\Local\Android\Sdk`
6. Under "User variables", select "Path" and click "Edit"
7. Click "New" and add these paths (one at a time):
   - `%ANDROID_HOME%\emulator`
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`
8. Click "OK" on all dialogs

#### Method C: Using Command Line (Temporary - Current Session Only)
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:LOCALAPPDATA\Android\Sdk\emulator;$env:LOCALAPPDATA\Android\Sdk\platform-tools"
```

### Step 3: Restart Your Terminal/IDE
⚠️ **IMPORTANT**: After setting environment variables, you MUST:
- Close and reopen your terminal/command prompt
- Restart VS Code/Cursor if you're using it
- Restart Expo development server if it's running

### Step 4: Verify Setup
Open a new terminal and run:
```powershell
echo $env:ANDROID_HOME
emulator -list-avds
```

You should see:
- The Android SDK path printed
- A list of available Android Virtual Devices (AVDs)

### Step 5: Create an Android Virtual Device (AVD) if None Exist
If `emulator -list-avds` returns nothing, you need to create an AVD:

1. Open Android Studio
2. Go to Tools → Device Manager
3. Click "Create Device"
4. Select a device (e.g., Pixel 5)
5. Download a system image if needed
6. Click "Finish"

Or use command line:
```powershell
# List available system images
sdkmanager --list | Select-String "system-images"

# Install a system image (example for API 33)
sdkmanager "system-images;android-33;google_apis;x86_64"

# Create AVD
avdmanager create avd -n "Pixel_5_API_33" -k "system-images;android-33;google_apis;x86_64"
```

### Step 6: Test Expo with Android
After restarting your terminal, run:
```bash
npm start
# Then press 'a' to open on Android emulator
```

## Troubleshooting

### If emulator still not found:
1. Verify the path: `C:\Users\KTCC\AppData\Local\Android\Sdk\emulator\emulator.exe`
2. Check if emulator is installed: Open Android Studio → SDK Manager → SDK Tools → Check "Android Emulator"
3. Try running emulator directly:
   ```powershell
   & "C:\Users\KTCC\AppData\Local\Android\Sdk\emulator\emulator.exe" -list-avds
   ```

### If PATH is not working:
- Make sure you restarted your terminal after setting environment variables
- Check PATH in new terminal: `echo $env:PATH`
- Verify Android SDK paths are included

### Alternative: Use Physical Device
If emulator setup is too complex, you can use a physical Android device:
1. Enable Developer Options on your phone
2. Enable USB Debugging
3. Connect via USB
4. Run `adb devices` to verify connection
5. Run `npm start` and press 'a'

## Quick Reference
- **Android SDK Location**: `C:\Users\KTCC\AppData\Local\Android\Sdk`
- **Emulator Path**: `C:\Users\KTCC\AppData\Local\Android\Sdk\emulator\emulator.exe`
- **ADB Path**: `C:\Users\KTCC\AppData\Local\Android\Sdk\platform-tools\adb.exe`










