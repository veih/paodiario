const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'data');
const destDir = path.join(process.cwd(), 'dist', 'data');

function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

if (fs.existsSync(srcDir)) {
    copyRecursive(srcDir, destDir);
    const files = fs.readdirSync(destDir);
    console.log(`✅ Copied ${files.length} files to dist/data/`);
} else {
    console.warn('⚠️ public/data directory not found');
}
