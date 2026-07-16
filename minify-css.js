const fs = require('fs');
const path = require('path');

const files = ['style.css', 'subscription.css'];

files.forEach(file => {
    const originalPath = path.join(__dirname, file);
    const devPath = path.join(__dirname, file.replace('.css', '.dev.css'));
    
    // 1. If the dev version doesn't exist yet, copy the original to the dev version
    if (!fs.existsSync(devPath)) {
        fs.copyFileSync(originalPath, devPath);
        console.log(`Created backup source file: ${devPath}`);
    }
    
    // 2. Read the source file (which is the dev version)
    const content = fs.readFileSync(devPath, 'utf8');
    
    // 3. Minify CSS
    const minified = content
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
        .replace(/\s+/g, ' ') // collapse multiple whitespaces/newlines to single space
        .replace(/\s*([\{\}:;,])\s*/g, '$1') // remove spaces around brackets and punctuation
        .replace(/;}/g, '}'); // remove final semicolon in rule blocks
        
    // 4. Overwrite original file
    fs.writeFileSync(originalPath, minified.trim());
    
    const origSize = fs.statSync(devPath).size;
    const minSize = fs.statSync(originalPath).size;
    console.log(`Minified ${file}: ${(origSize / 1024).toFixed(2)} KB -> ${(minSize / 1024).toFixed(2)} KB (Saved: ${((origSize - minSize) / 1024).toFixed(2)} KB)`);
});
