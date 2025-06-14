
// Build script for packaging the extension
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const packageExtension = () => {
  const output = fs.createWriteStream('dm-decoder-extension.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`Extension packaged: ${archive.pointer()} total bytes`);
    console.log('Ready for Chrome Web Store submission!');
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // Add all extension files except build script and README
  archive.file('manifest.json', { name: 'manifest.json' });
  archive.file('background.js', { name: 'background.js' });
  archive.file('content.js', { name: 'content.js' });
  archive.file('content.css', { name: 'content.css' });
  archive.file('popup.html', { name: 'popup.html' });
  archive.file('popup.js', { name: 'popup.js' });
  
  // Add icons directory if it exists
  if (fs.existsSync('icons')) {
    archive.directory('icons/', 'icons/');
  }

  archive.finalize();
};

// Run if called directly
if (require.main === module) {
  packageExtension();
}

module.exports = { packageExtension };
