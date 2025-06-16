# Start script for Windows
Write-Host "🚀 Starting production server..." -ForegroundColor Blue

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    Write-Host "📝 Please create a .env file with your production environment variables" -ForegroundColor Blue
    exit 1
}

# Check if build exists
if (-not (Test-Path .next)) {
    Write-Host "❌ Error: Build not found" -ForegroundColor Red
    Write-Host "📝 Please run the build script first:" -ForegroundColor Blue
    Write-Host ".\scripts\build.ps1" -ForegroundColor Green
    exit 1
}

# Start the production server
Write-Host "✨ Starting production server..." -ForegroundColor Green
bun run start 