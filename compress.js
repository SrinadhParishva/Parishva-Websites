const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Installing sharp locally to perform image conversion...');
try {
  execSync('npm install sharp', { stdio: 'inherit' });
  console.log('sharp installed successfully.');
} catch (err) {
  console.error('Failed to install sharp:', err.message);
  process.exit(1);
}

const sharp = require('sharp');

const images = [
  { src: 'founder.png', dest: 'founder.webp', options: { quality: 80 } },
  { src: 'logo.jpeg', dest: 'logo.webp', options: { quality: 80 } }
];

async function run() {
  for (const img of images) {
    const srcPath = path.join(__dirname, img.src);
    const destPath = path.join(__dirname, img.dest);
    
    if (fs.existsSync(srcPath)) {
      console.log(`Converting ${img.src} to ${img.dest}...`);
      await sharp(srcPath)
        .webp(img.options)
        .toFile(destPath);
      
      const srcSize = fs.statSync(srcPath).size;
      const destSize = fs.statSync(destPath).size;
      console.log(`Successfully converted ${img.src} (${(srcSize / 1024).toFixed(2)} KB) to ${img.dest} (${(destSize / 1024).toFixed(2)} KB). Saved: ${((srcSize - destSize) / 1024).toFixed(2)} KB.`);
    } else {
      console.warn(`Source image not found: ${srcPath}`);
    }
  }
}

run().catch(console.error);
