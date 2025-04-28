# Exit on any error
$ErrorActionPreference = "Stop"

# Paths
$rootPath = Get-Location
$playerPath = Join-Path $rootPath "apps/gb-player"
$consolePath = Join-Path $rootPath "apps/gb-console"
$outputPath = Join-Path $rootPath "dist/static/gb-console"

# Go to console app
if (-Not (Test-Path $consolePath)) {
    Write-Error "Console path not found!"
    exit 1
}

Set-Location $consolePath

Write-Host "Cleanup previous build"
if (Test-Path $outputPath) {
    Remove-Item -Recurse -Force $outputPath
} else {
    Write-Host "Console build not found!"
}

Write-Host "🔧 Building project in $consolePath"
pnpm install
pnpm build

Write-Host "📁 Copying static files to standalone directory..."
New-Item -ItemType Directory -Force -Path ".next/standalone/.next" | Out-Null

Copy-Item -Recurse -Force -Path "public" -Destination ".next/standalone/"
Copy-Item -Recurse -Force -Path ".next/static" -Destination ".next/standalone/.next/"

Write-Host "📦 Copying build to $outputPath"
New-Item -ItemType Directory -Force -Path $outputPath | Out-Null
Copy-Item -Recurse -Force -Path ".next/standalone/." -Destination $outputPath

Write-Host "✅ Build and copy complete!"
Write-Host "🚀 Now you can run your app with:"
$serverJsPath = Join-Path $outputPath "server.js"
Write-Host "node $(serverJsPath)"
