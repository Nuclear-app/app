# Cleanup script for Windows
Write-Host "🧹 Cleaning up project..." -ForegroundColor Blue

# Remove build artifacts
Write-Host "🗑️  Removing build artifacts..." -ForegroundColor Blue
if (Test-Path .next) { Remove-Item -Recurse -Force .next }
if (Test-Path out) { Remove-Item -Recurse -Force out }
if (Test-Path dist) { Remove-Item -Recurse -Force dist }

# Remove dependencies
Write-Host "🗑️  Removing dependencies..." -ForegroundColor Blue
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }

# Remove Prisma generated files
Write-Host "🗑️  Removing Prisma generated files..." -ForegroundColor Blue
if (Test-Path prisma/generated) { Remove-Item -Recurse -Force prisma/generated }

Write-Host "✅ Cleanup completed!" -ForegroundColor Green
Write-Host "To reinstall dependencies and start development, run:" -ForegroundColor Blue
Write-Host ".\scripts\dev.ps1" -ForegroundColor Green 