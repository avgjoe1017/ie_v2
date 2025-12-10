# Turso Manual Installer for Windows
# Run with: .\scripts\install-turso-manual.ps1

# Hardcoded stable version to avoid GitHub scraping issues
$versionTag = "v0.96.6" 

Write-Host "⬇️  Installing Turso CLI ($versionTag)..." -ForegroundColor Cyan

# Define URL and Paths
$downloadUrl = "https://github.com/tursodatabase/turso-cli/releases/download/$versionTag/turso-windows-amd64.exe"
$installDir = "$env:USERPROFILE\.turso"
$exePath = "$installDir\turso.exe"

# Create directory
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Force -Path $installDir | Out-Null
}

Write-Host "   Downloading from: $downloadUrl" -ForegroundColor Gray

try {
    # Use TLS 1.2
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $downloadUrl -OutFile $exePath
    Write-Host "✅ Download complete!" -ForegroundColor Green
} catch {
    Write-Host "❌ Download failed: $_" -ForegroundColor Red
    Write-Host "   Please manually download from: $downloadUrl"
    Write-Host "   And save it to: $exePath"
    exit 1
}

# Add to PATH if not present
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$installDir*") {
    Write-Host "🔧 Adding to PATH..." -ForegroundColor Cyan
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$installDir", "User")
    $env:Path += ";$installDir"
    Write-Host "✅ Added $installDir to User PATH" -ForegroundColor Green
} else {
    Write-Host "✅ Already in PATH" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Turso CLI Installed!" -ForegroundColor Green
Write-Host "👉 Now run: .\scripts\setup-turso.ps1" -ForegroundColor Cyan
