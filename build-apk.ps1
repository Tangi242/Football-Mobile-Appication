# Build APK Script for NamFootball Hub
Write-Host "Building APK for NamFootball Hub..." -ForegroundColor Green

# Check if EAS CLI is available
Write-Host "Checking EAS CLI..." -ForegroundColor Yellow
$easVersion = npx eas-cli --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: EAS CLI not available. Please install it first." -ForegroundColor Red
    exit 1
}

Write-Host "EAS CLI version: $easVersion" -ForegroundColor Green

# Check if logged in
Write-Host "Checking Expo account login status..." -ForegroundColor Yellow
$loginCheck = npx eas-cli whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Expo. Please log in first:" -ForegroundColor Yellow
    Write-Host "  npx eas-cli login" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Attempting to build anyway (may require login)..." -ForegroundColor Yellow
}

# Build APK
Write-Host ""
Write-Host "Starting APK build (this may take 10-20 minutes)..." -ForegroundColor Green
Write-Host "Building preview APK..." -ForegroundColor Yellow

$buildOutput = npx eas-cli build --platform android --profile preview --non-interactive 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host $buildOutput
    
    # Try to download the APK
    Write-Host ""
    Write-Host "Attempting to download APK..." -ForegroundColor Yellow
    $downloadOutput = npx eas-cli build:list --platform android --limit 1 --json 2>&1 | ConvertFrom-Json
    if ($downloadOutput) {
        $latestBuild = $downloadOutput[0]
        if ($latestBuild.artifacts) {
            $apkUrl = $latestBuild.artifacts.buildUrl
            Write-Host "APK URL: $apkUrl" -ForegroundColor Cyan
            Write-Host "Downloading to Desktop..." -ForegroundColor Yellow
            
            $desktopPath = [Environment]::GetFolderPath("Desktop")
            $apkPath = Join-Path $desktopPath "NamFootball_Hub.apk"
            
            try {
                Invoke-WebRequest -Uri $apkUrl -OutFile $apkPath
                Write-Host "APK downloaded successfully to: $apkPath" -ForegroundColor Green
            } catch {
                Write-Host "Could not automatically download. Please download manually from:" -ForegroundColor Yellow
                Write-Host $apkUrl -ForegroundColor Cyan
            }
        }
    }
} else {
    Write-Host "Build failed or requires login." -ForegroundColor Red
    Write-Host $buildOutput
    Write-Host ""
    Write-Host "To build manually:" -ForegroundColor Yellow
    Write-Host "1. Login: npx eas-cli login" -ForegroundColor Cyan
    Write-Host "2. Build: npx eas-cli build --platform android --profile preview" -ForegroundColor Cyan
    Write-Host "3. Download from: https://expo.dev/accounts/[your-account]/builds" -ForegroundColor Cyan
}

