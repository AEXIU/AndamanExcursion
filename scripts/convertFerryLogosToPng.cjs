/**
 * Ferry Partner SVG to PNG Converter
 * Converts ferry partner logos from SVG to PNG format for PDF use
 * (react-pdf has limited SVG support, PNG works reliably)
 *
 * Usage: node scripts/convertFerryLogosToPng.cjs
 */

const fs = require('fs');
const path = require('path');

const PARTNERS_DIR = 'public/icons/partners';

// Ferry logos to convert
const FERRY_LOGOS = {
  makruzz: 'makruzz.svg',
  greenOcean: 'greenOcean.svg',
  nautika: 'nautika.svg',
};

// Check if source files exist
console.log('🔍 Checking source SVG files...\n');

for (const [name, file] of Object.entries(FERRY_LOGOS)) {
  const fullPath = path.join(PARTNERS_DIR, file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ Found: ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.error(`❌ Missing: ${file}`);
  }
}

// Method 1: Try using sharp (if installed)
async function convertWithSharp() {
  try {
    const sharp = require('sharp');
    console.log('\n🔄 Converting SVG logos to PNG using Sharp...\n');

    for (const [name, file] of Object.entries(FERRY_LOGOS)) {
      const svgPath = path.join(PARTNERS_DIR, file);
      const pngPath = path.join(PARTNERS_DIR, file.replace('.svg', '.png'));

      if (!fs.existsSync(svgPath)) {
        console.warn(`⚠️ Skipping ${file} - not found`);
        continue;
      }

      try {
        const svgBuffer = fs.readFileSync(svgPath);

        // Convert to PNG with reasonable size for PDF (300px width)
        await sharp(svgBuffer)
          .resize(300, null, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 } // transparent
          })
          .png()
          .toFile(pngPath);

        const stats = fs.statSync(pngPath);
        console.log(`✅ Created: ${file.replace('.svg', '.png')} (${(stats.size / 1024).toFixed(1)} KB)`);
      } catch (convErr) {
        console.error(`❌ Failed to convert ${file}:`, convErr.message);
      }
    }

    console.log('\n✨ Conversion complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Update scripts/convertImagesToBase64.cjs to use .png files');
    console.log('2. Run: node scripts/convertImagesToBase64.cjs');
    return true;
  } catch (error) {
    return false;
  }
}

// Method 2: Manual instructions
function showManualInstructions() {
  console.log('\n📝 MANUAL CONVERSION REQUIRED\n');
  console.log('Sharp library not found or failed. Please convert manually:\n');
  console.log('Option 1 - Online Converter (Easiest):');
  console.log('1. Go to: https://cloudconvert.com/svg-to-png');
  console.log('2. Upload each SVG file from: public/icons/partners/');
  console.log('3. Set width to 300px, transparent background');
  console.log('4. Download and save as .png in the same folder:\n');

  for (const [name, file] of Object.entries(FERRY_LOGOS)) {
    console.log(`   - ${file} → ${file.replace('.svg', '.png')}`);
  }

  console.log('\nOption 2 - Install Sharp and retry:');
  console.log('npm install --save-dev sharp');
  console.log('node scripts/convertFerryLogosToPng.cjs\n');

  console.log('Option 3 - Use Photoshop/GIMP/Inkscape:');
  console.log('Open each SVG, export as PNG (300px width, transparent background)\n');
}

// Try conversion
convertWithSharp().then(success => {
  if (!success) {
    showManualInstructions();
  }
}).catch(err => {
  console.error('Error:', err.message);
  showManualInstructions();
});
