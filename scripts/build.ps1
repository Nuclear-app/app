# Build script for Windows
Write-Host "🏗️  Starting production build..." -ForegroundColor Blue

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    Write-Host "📝 Please create a .env file with your production environment variables" -ForegroundColor Blue
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
bun install --production

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Blue
bunx prisma generate

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Blue
bun run build

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host "To start the production server, run:" -ForegroundColor Blue
Write-Host ".\scripts\start.ps1" -ForegroundColor Green 