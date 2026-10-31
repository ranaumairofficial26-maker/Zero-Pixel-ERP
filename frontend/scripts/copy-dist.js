const fs = require('fs');
const path = require('path');

// Copies browser artifacts directly into dist/frontend so both Vercel's
// legacy output directory (dist/frontend) and modern output directory
// (dist/frontend/browser) find index.html without any errors.
const src = path.join(__dirname, '..', 'dist', 'frontend', 'browser');
const dst = path.join(__dirname, '..', 'dist', 'frontend');

if (fs.existsSync(src)) {
  fs.readdirSync(src).forEach(file => {
    const s = path.join(src, file);
    const d = path.join(dst, file);
    if (fs.statSync(s).isFile()) {
      fs.copyFileSync(s, d);
    }
  });
  console.log('✓ Successfully mirrored build artifacts to dist/frontend for Vercel deployment.');
}

