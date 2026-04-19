#!/bin/bash
# Clean build script for Vercel

echo "🧹 Cleaning old builds..."
rm -rf dist .expo/web-build

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🏗️ Building Expo web..."
npx expo export --platform web

echo "📁 Copying data files..."
node -e "
const fs = require('fs');
const path = require('path');
const src = path.join('public', 'data');
const dest = path.join('dist', 'data');
if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
fs.readdirSync(src).forEach(f => {
  fs.copyFileSync(path.join(src, f), path.join(dest, f));
});
console.log('Copied', fs.readdirSync(dest).length, 'files');
"

echo "✅ Build complete!"
