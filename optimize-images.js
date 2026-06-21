const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, 'public', 'images');
const dirsToUpdate = [path.join(__dirname, 'app'), path.join(__dirname, 'components'), path.join(__dirname, 'src')];

async function processAll() {
  const files = fs.readdirSync(imagesDir);
  const replacements = [];

  console.log('Converting images to WebP...');
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      const inputPath = path.join(imagesDir, file);
      const nameWithoutExt = path.basename(file, path.extname(file));
      const outputFilename = nameWithoutExt + '.webp';
      const outputPath = path.join(imagesDir, outputFilename);
      
      try {
        await sharp(inputPath)
          .resize({ width: 1920, withoutEnlargement: true }) // ensure they aren't massive
          .webp({ quality: 80 })
          .toFile(outputPath);
        
        console.log(`Converted ${file} to ${outputFilename}`);
        replacements.push({ from: file, to: outputFilename });
      } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
      }
    }
  }

  console.log('\nUpdating references in codebase...');
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function updateFilesInDir(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        updateFilesInDir(fullPath);
      } else if (['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(fullPath))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;
        
        for (const { from, to } of replacements) {
          const regex = new RegExp(`(/images/)${escapeRegExp(from)}`, 'g');
          if (regex.test(content)) {
            content = content.replace(regex, `$1${to}`);
            modified = true;
          }
        }
        
        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated references in ${fullPath.replace(__dirname, '')}`);
        }
      }
    }
  }

  for (const dir of dirsToUpdate) {
    updateFilesInDir(dir);
  }
  
  console.log('\nImage optimization complete!');
}

processAll();
