// Syncs the built frontend (frontend/dist) into backend/public so the single
// Express server can serve the SPA on platforms like Vercel (single function).
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'frontend', 'dist');
const dest = path.join(__dirname, '..', 'backend', 'public');

function copyRecursive(from, to) {
    const entries = fs.readdirSync(from, { withFileTypes: true });
    fs.mkdirSync(to, { recursive: true });
    for (const entry of entries) {
        const fromPath = path.join(from, entry.name);
        const toPath = path.join(to, entry.name);
        if (entry.isDirectory()) {
            copyRecursive(fromPath, toPath);
        } else if (entry.isFile()) {
            fs.copyFileSync(fromPath, toPath);
        }
    }
}

if (!fs.existsSync(src)) {
    console.error('frontend/dist not found. Run the frontend build first.');
    process.exit(1);
}

try {
    fs.rmSync(dest, { recursive: true, force: true });
} catch (e) {
    // Best effort on Windows where the running server may lock files
}
fs.mkdirSync(dest, { recursive: true });
copyRecursive(src, dest);

console.log('Frontend build synced to backend/public (' + dest + ')');
