# Parse command line arguments
param(
    [switch]$c,
    [switch]$b
)

# Exit on error
$ErrorActionPreference = "Stop"

# Initialize flag variable
$CHECK_BRANCH = $true

if ($c -or $b) {
    $CHECK_BRANCH = $false
}

Write-Host "Starting development environment..." -ForegroundColor Blue

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "GO MAKE A .env. NOWWWWW!!!" -ForegroundColor Blue
    touch .env
    Write-Host "📝 .env created. Please add your environment variables." -ForegroundColor Blue
    exit 1
}

if (-not (Test-Path .env.local)) {
    Write-Host "GO MAKE A .env.local. NOWWWWW!!!" -ForegroundColor Blue
    touch .env.local
    Write-Host "📝 .env.local created. Please add your environment variables." -ForegroundColor Blue
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Blue
    bun install
}

# git pull
Write-Host "Pulling latest changes..." -ForegroundColor Blue
# Temporarily change error action to continue so we can handle git pull errors
$originalErrorAction = $ErrorActionPreference
$ErrorActionPreference = "Continue"

try {
    $pullOutput = git pull 2>&1
    if ($LASTEXITCODE -ne 0) {
        # Check if the error is about no tracking information
        if ($pullOutput -match "no tracking information for the current branch") {
            Write-Host "No upstream tracking set. Setting upstream and retrying..." -ForegroundColor Blue
            $currentBranch = git symbolic-ref --short HEAD
            git push --set-upstream origin $currentBranch
            Write-Host "Retrying git pull..." -ForegroundColor Blue
            git pull
        } else {
            Write-Host "Git pull failed with an unknown error" -ForegroundColor Red
            $ErrorActionPreference = $originalErrorAction
            exit 1
        }
    }
} catch {
    Write-Host "Git pull failed with an unknown error" -ForegroundColor Red
    $ErrorActionPreference = $originalErrorAction
    exit 1
}

# Restore original error action preference
$ErrorActionPreference = $originalErrorAction

# Get current branch
$branch = git symbolic-ref --short HEAD

# Only check branch if CHECK_BRANCH is true
if ($CHECK_BRANCH) {
    Write-Host "Please confirm you're on the right branch..." -ForegroundColor Blue
    $answer = Read-Host "(Y/n)"
    if ([string]::IsNullOrEmpty($answer)) { $answer = "Y" }

    if ($answer -ne "Y" -and $answer -ne "y") {
        Write-Host "Error: GO TO RIGHT BRANCH" -ForegroundColor Red
        exit 1
    }
}

# if branch == main, then confirm with read -p "Are you sure you want to continue? (y/n)" answer
if ($branch -eq "main") {
    Write-Host "Are you sure you want to edit main? (y/n)" -ForegroundColor Blue
    $answer = Read-Host "(Y/n)"
    if ([string]::IsNullOrEmpty($answer)) { $answer = "Y" }

    if ($answer -ne "Y" -and $answer -ne "y") {
        Write-Host "Error: GO TO RIGHT BRANCH" -ForegroundColor Red
        exit 1
    }
}

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Blue
try {
    bunx prisma generate
} catch {
    Write-Host "Falling back to bun prisma generate..." -ForegroundColor Blue
    bun prisma generate
}

# Start the development server
Write-Host "Starting development server..." -ForegroundColor Green
bun run dev 