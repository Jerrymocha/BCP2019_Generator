const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'content');
let manifest = [];

function scanDirectory(currentDir, traditionTag = '') {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      // If it's a folder like 'contemporary' or 'traditional', pass it along as the tradition tag
      scanDirectory(fullPath, entry.name);
    } else if (entry.name.endsWith('.txt')) {
      // Get the relative path for web fetching (e.g., "contemporary/03_collect.txt")
      const relativePath = path.relative(contentDir, fullPath).replace(/\\/g, '/');
      
      // Automatically generate a nice title from the filename 
      // (e.g., "02_confession_of_sin.txt" -> "Confession Of Sin")
      let cleanTitle = entry.name
        .replace(/^\d+_/, '')           // Remove leading numbers like "01_"
        .replace('.txt', '')            // Remove extension
        .replace(/_/g, ' ')             // Replace underscores with spaces
        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words

      manifest.push({
        file: relativePath,
        title: cleanTitle,
        tradition: traditionTag || 'general',
        description: `${traditionTag ? traditionTag.charAt(0).toUpperCase() + traditionTag.slice(1) : 'General'} liturgy piece.`
      });
    }
  }
}

// Run the scan
console.log('Scanning content folder...');
scanDirectory(contentDir);

// Sort manifest alphabetically by title for neatness
manifest.sort((a, b) => a.title.localeCompare(b.title));

// Write out the manifest.json file inside the content folder
const outputPath = path.join(contentDir, 'manifest.json');
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf8');

console.log(`Success! Generated manifest.json with ${manifest.length} items.`);
