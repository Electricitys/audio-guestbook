# Exit on any error
$ErrorActionPreference = "Stop"

# Paths
$rootPath = Get-Location
$playerPath = Join-Path $rootPath "apps/gb-player"
$outputPath = Join-Path $rootPath "dist/static/gb-player"

# Go to player app
if (-Not (Test-Path $playerPath)) {
    Write-Error "Player path not found!"
    exit 1
}

Set-Location $playerPath

Write-Host "🔧 Compressing the static console"
New-Item -ItemType Directory -Force -Path $outputPath | Out-Null
deno run --allow-read --allow-write src/utils/zipper.ts -o "$outputPath/console.zip" "$rootPath/dist/static/gb-console"

Write-Host "🔧 Building project in $playerPath"
deno install
deno compile -A --include audio/ --include "$outputPath/console.zip" -o "$outputPath/player_server" main.ts

Write-Host "✅ Build and copy complete!"
Write-Host "🚀 Now you can run your app with:"
Write-Host "$outputPath/player_server"
