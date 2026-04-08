const fs = require('fs');
const path = require('path');

// Fix missing commas in all JS/JSX files
// Pattern: a line ending with a quoted value (no comma) followed by a line with a property key
const files = [
  'src/Data/mockData.js',
  'src/Data/comprehensiveMockData.js',
  'src/Data/massiveMockData.js',
  ...findJsxFiles('src/Pages'),
  ...findJsxFiles('src/Shared'),
];

function findJsxFiles(dir) {
  const result = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        result.push(...findJsxFiles(fullPath));
      } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
        result.push(fullPath);
      }
    }
  } catch (e) {}
  return result;
}

let totalFixes = 0;

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    // Fix pattern: line ending with 'value' or "value" (NO comma) 
    // followed by line with property: value
    // This specifically targets missing commas before Fr fields but is generic
    content = content.replace(
      /(['"])\s*\n(\s+)(\w+Fr:\s)/g,
      (match, quote, whitespace, propFr) => {
        // Check if the line already has a comma
        return `${quote},\n${whitespace}${propFr}`;
      }
    );
    
    // Also fix pattern: line ending with 'value' or "value" (NO comma)
    // followed by NEXT line that starts a new property
    // More targeted: Ar field without comma followed by Fr field
    content = content.replace(
      /(['"]\s*)\n(\s+)(\w+Fr:)/g,
      (match, ending, whitespace, propFr) => {
        if (ending.trim().endsWith(',')) return match;
        return `${ending.trimEnd()},\n${whitespace}${propFr}`;
      }
    );

    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(`Fixed: ${file}`);
      totalFixes++;
    }
  } catch (e) {
    // Skip files that can't be read
  }
}

console.log(`\nFixed ${totalFixes} files`);
