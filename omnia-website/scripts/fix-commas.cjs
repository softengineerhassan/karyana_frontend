const fs = require('fs');
const path = require('path');

// Fix missing commas before Fr fields in all source files
const srcDir = path.join(__dirname, '..', 'src');

function walkDir(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

let totalFixed = 0;

for (const file of walkDir(srcDir)) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Fix patterns like:  fieldAr: "value"\n    fieldFr: "value"
  // where there's a missing comma after the Ar line
  content = content.replace(
    /([A-Za-z]+Ar:\s*"[^"]*")\s*\n(\s+)([a-zA-Z]+Fr:)/g,
    '$1,\n$2$3'
  );
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    const count = (content.match(/,\n\s+[a-zA-Z]+Fr:/g) || []).length;
    console.log(`Fixed: ${path.relative(path.join(__dirname, '..'), file)}`);
    totalFixed++;
  }
}

console.log(`\nFixed ${totalFixed} files`);
