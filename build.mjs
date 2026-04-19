import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧹 Cleaning old builds...');
fs.rmSync('dist', { recursive: true, force: true });
fs.rmSync('.expo/web-build', { recursive: true, force: true });

console.log('📦 Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

console.log('🔧 Generating Prisma client...');
execSync('npx prisma generate', { stdio: 'inherit' });

console.log('🏗️ Building Expo web...');
execSync('npx expo export --platform web', { stdio: 'inherit' });

console.log('📁 Copying data files...');
const src = path.join('public', 'data');
const dest = path.join('dist', 'data');
if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
let count = 0;
for (const f of fs.readdirSync(src)) {
    fs.copyFileSync(path.join(src, f), path.join(dest, f));
    count++;
}
console.log(`Copied ${count} files`);

console.log('✅ Build complete!');
