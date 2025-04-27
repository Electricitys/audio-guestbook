#!/bin/bash

set -e  # Exit on any error

# Paths
root_path="$(pwd)"
player_path="$root_path/apps/gb-player"
output_path="$root_path/dist/static/gb-player"

# Go to console app
cd "$player_path" || { echo "Player path not found!"; exit 1; }

echo "🔧 Compressing the static console"
mkdir -p $output_path
deno run --allow-read --allow-write src/utils/zipper.ts -o $output_path/console.zip $root_path/dist/static/gb-console 

echo "🔧 Building project in $player_path"
deno install && deno compile -A --include audio/ --include $output_path/console.zip -o $output_path/player_server main.ts

echo "✅ Build and copy complete!"
echo "🚀 Now you can run your app with:"
echo "${output_path}/player_server"