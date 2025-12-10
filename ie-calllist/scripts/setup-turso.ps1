# Turso Database Setup Script for Windows
# Run with: .\scripts\setup-turso.ps1

Write-Host "🚀 Setting up Turso database for production..." -ForegroundColor Cyan
Write-Host ""

# Check if Turso CLI is installed
$tursoInstalled = Get-Command turso -ErrorAction SilentlyContinue

if (-not $tursoInstalled) {
    Write-Host "❌ Turso CLI not found. Installing..." -ForegroundColor Yellow
    Write-Host "   Run: irm get.tur.so/install.ps1 | iex" -ForegroundColor Yellow
    Write-Host ""
    $install = Read-Host "Would you like to install Turso CLI now? (y/n)"
    
    if ($install -eq "y" -or $install -eq "Y") {
        irm get.tur.so/install.ps1 | iex
        Write-Host "✅ Turso CLI installed. Please restart your terminal and run this script again." -ForegroundColor Green
        exit
    } else {
        Write-Host "❌ Please install Turso CLI first, then run this script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Turso CLI found" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "Checking Turso authentication..." -ForegroundColor Cyan
$tursoAuth = turso auth whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Turso" -ForegroundColor Yellow
    Write-Host "   Run: turso auth login" -ForegroundColor Yellow
    Write-Host ""
    $login = Read-Host "Would you like to login now? (y/n)"
    
    if ($login -eq "y" -or $login -eq "Y") {
        turso auth login
    } else {
        Write-Host "❌ Please login to Turso first." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Authenticated with Turso" -ForegroundColor Green
Write-Host ""

# Check if database exists
Write-Host "Checking for database 'ie-calllist'..." -ForegroundColor Cyan
$dbExists = turso db list | Select-String "ie-calllist"

if (-not $dbExists) {
    Write-Host "❌ Database 'ie-calllist' not found" -ForegroundColor Yellow
    Write-Host "   Creating database..." -ForegroundColor Cyan
    turso db create ie-calllist
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Database 'ie-calllist' exists" -ForegroundColor Green
}

Write-Host ""

# Get database URL
Write-Host "📋 Database URL:" -ForegroundColor Cyan
$dbUrl = turso db show ie-calllist --url
Write-Host "   $dbUrl" -ForegroundColor White
Write-Host ""

# Create auth token
Write-Host "🔑 Creating authentication token..." -ForegroundColor Cyan
$token = turso db tokens create ie-calllist
Write-Host "   Token created (saved above)" -ForegroundColor Green
Write-Host ""

# Display summary
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📝 Add these to Vercel Environment Variables:" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "DATABASE_URL = $dbUrl" -ForegroundColor White
Write-Host "TURSO_DATABASE_URL = $dbUrl" -ForegroundColor White
Write-Host "TURSO_AUTH_TOKEN = $token" -ForegroundColor White
Write-Host ""
Write-Host "SESSION_SECRET = (run: npx tsx scripts/generate-session-secret.ts)" -ForegroundColor White
Write-Host "NEXT_PUBLIC_APP_URL = https://your-project.vercel.app" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Ask about pushing schema
$pushSchema = Read-Host "Would you like to push Prisma schema to Turso now? (y/n)"
if ($pushSchema -eq "y" -or $pushSchema -eq "Y") {
    $fullUrl = "$dbUrl`?authToken=$token"
    Write-Host "Pushing schema..." -ForegroundColor Cyan
    $env:DATABASE_URL = $fullUrl
    npx prisma db push
    Write-Host "✅ Schema pushed to Turso" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Setup complete! See MD_DOCS/DEPLOYMENT_CHECKLIST.md for next steps." -ForegroundColor Green

