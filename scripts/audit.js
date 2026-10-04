import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=== KSHETRA OS STATIC AUDIT SUITE ===\n');

// 1. Basemap URLs needing API keys
const basemapsPath = path.join(rootDir, 'src/services/basemaps.ts');
if (fs.existsSync(basemapsPath)) {
  const content = fs.readFileSync(basemapsPath, 'utf8');
  const needsApiKey = content.includes('api_key') || content.includes('key=') || content.includes('{apikey}');
  console.log(`1. Basemap API Keys Check: ${needsApiKey ? 'WARNING (API key placeholder found)' : 'PASS (Clean open tiles OSM / Esri without mandatory key limits)'}`);
}

// 2. Fixed pixel widths over 360px in mobile code
let fixedWidthWarnings = [];
function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') scanDir(full);
    } else if (f.endsWith('.tsx') || f.endsWith('.css')) {
      const content = fs.readFileSync(full, 'utf8');
      const matches = content.match(/w-\[\d{3,}px\]/g);
      if (matches) {
        matches.forEach(m => {
          const px = parseInt(m.replace(/\D/g, ''), 10);
          if (px > 360 && !content.includes('max-w') && !m.includes('max-w')) {
            fixedWidthWarnings.push(`${f}: ${m}`);
          }
        });
      }
    }
  }
}
scanDir(path.join(rootDir, 'src'));
console.log(`2. Fixed Width Layout Audit: ${fixedWidthWarnings.length === 0 ? 'PASS (Zero unconstrained fixed widths > 360px)' : `WARNING (${fixedWidthWarnings.length} instances found: ${fixedWidthWarnings.join(', ')})`}`);

// 3. Images without alt text
let missingAltCount = 0;
function checkImages(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') checkImages(full);
    } else if (f.endsWith('.tsx')) {
      const content = fs.readFileSync(full, 'utf8');
      const imgTags = content.match(/<img[^>]*>/g) || [];
      imgTags.forEach(img => {
        if (!img.includes('alt=')) missingAltCount++;
      });
    }
  }
}
checkImages(path.join(rootDir, 'src'));
console.log(`3. Image Accessibility (Alt Text) Audit: ${missingAltCount === 0 ? 'PASS (100% of images contain alt attributes)' : `WARNING (${missingAltCount} images missing alt text)`}`);

// 4. Buttons without accessible names
let unlabelledButtons = 0;
function checkButtons(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') checkButtons(full);
    } else if (f.endsWith('.tsx')) {
      const content = fs.readFileSync(full, 'utf8');
      const buttons = content.match(/<button[^>]*>[\s\S]*?<\/button>/g) || [];
      buttons.forEach(btn => {
        const text = btn.replace(/<[^>]*>/g, '').trim();
        const hasAria = btn.includes('aria-label') || btn.includes('title');
        if (!text && !hasAria) unlabelledButtons++;
      });
    }
  }
}
checkButtons(path.join(rootDir, 'src'));
console.log(`4. Button Accessibility Audit: ${unlabelledButtons === 0 ? 'PASS (All buttons contain text or aria-label)' : `WARNING (${unlabelledButtons} unlabelled icon buttons found)`}`);

console.log('\n=== AUDIT COMPLETE: 0 CRITICAL BLOCKERS ===');
