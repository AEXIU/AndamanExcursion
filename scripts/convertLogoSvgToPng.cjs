/**
 * SVG to PNG Converter for Logo
 * Converts logo_white.svg to PNG format for PDF use
 *
 * Usage: node scripts/convertLogoSvgToPng.cjs
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const SVG_PATH = 'public/icons/logo_white.svg';
const OUTPUT_DIR = 'public/icons';

// Check if SVG exists
if (!fs.existsSync(SVG_PATH)) {
  console.error('❌ Error: logo_white.svg not found at:', SVG_PATH);
  process.exit(1);
}

console.log('🔄 Converting SVG logo to PNG...\n');

// Method 1: Try using sharp (if installed)
async function convertWithSharp() {
  try {
    const sharp = require('sharp');
    const svgBuffer = fs.readFileSync(SVG_PATH);

    // Large version (800px width)
    await sharp(svgBuffer)
      .resize(800, null, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'logo-white-large.png'));

    console.log('✅ Created: public/icons/logo-white-large.png (800px)');

    // Small version (200px width)
    await sharp(svgBuffer)
      .resize(200, null, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'logo-white-small.png'));

    console.log('✅ Created: public/icons/logo-white-small.png (200px)');
    console.log('\n✨ Conversion complete! Now run: node scripts/convertImagesToBase64.cjs');
    return true;
  } catch (error) {
    return false;
  }
}

// Method 2: Manual instructions
function showManualInstructions() {
  console.log('\n📝 MANUAL CONVERSION REQUIRED\n');
  console.log('Sharp library not found. Please convert manually:\n');
  console.log('Option 1 - Online Converter (Easiest):');
  console.log('1. Go to: https://cloudconvert.com/svg-to-png');
  console.log('2. Upload: d:\\iamplus\\andamanexcursion\\public\\icons\\logo_white.svg');
  console.log('3. Set width to 800px, transparent background');
  console.log('4. Download and save as: public/icons/logo-white-large.png');
  console.log('5. Repeat with 200px width → public/icons/logo-white-small.png\n');

  console.log('Option 2 - Install Sharp and retry:');
  console.log('npm install --save-dev sharp');
  console.log('node scripts/convertLogoSvgToPng.cjs\n');

  console.log('Option 3 - Use Photoshop/GIMP:');
  console.log('Open SVG, export as PNG (800x258 and 200x65)\n');
}

// Try conversion
convertWithSharp().then(success => {
  if (!success) {
    showManualInstructions();
  }
}).catch(err => {
  showManualInstructions();
});
