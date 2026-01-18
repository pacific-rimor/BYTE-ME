const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'MMX.png');
const dest = path.join(__dirname, 'public', 'logo.png');

console.log('Source:', source);
console.log('Dest:', dest);

if (fs.existsSync(source)) {
    console.log('✓ Source file exists');
    console.log('  Size:', fs.statSync(source).size, 'bytes');

    fs.copyFileSync(source, dest);
    console.log('✓ File copied successfully');

    if (fs.existsSync(dest)) {
        console.log('✓ Destination file verified');
        console.log('  Size:', fs.statSync(dest).size, 'bytes');
    }
} else {
    console.log('✗ Source file NOT found at:', source);
}
