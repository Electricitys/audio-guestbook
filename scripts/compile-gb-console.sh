#!/bin/bash

set -e  # Exit on any error

# Paths
root_path="$(pwd)"
player_path="$root_path/apps/gb-player"
console_path="$root_path/apps/gb-console"
output_path="$root_path/dist/static/gb-console"

# Go to console app
cd "$console_path" || { echo "Console path not found!"; exit 1; }

echo "Cleanup previous build"
rm -rf $output_path || { echo "Console build not found!"; exit 1; }

echo "🔧 Building project in $console_path"
pnpm install && pnpm build

echo "📁 Copying static files to standalone directory..."
mkdir -p .next/standalone/.next
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

echo "📦 Copying build to $output_path"
mkdir -p "$output_path"
cp -aL .next/standalone/. "$output_path/"

echo "✅ Build and copy complete!"
echo "🚀 Now you can run your app with:"
echo "node $output_path/server.js"