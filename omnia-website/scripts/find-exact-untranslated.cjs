const fs = require('fs');

// Find remaining untranslated Fr fields that have English-looking text equal to the base field
function findRemaining(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const remaining = [];
  
  for (let i = 0; i < lines.length; i++) {
    const frMatch = lines[i].match(/^\s*(\w+)Fr:\s*'((?:[^'\\]|\\.)*?)'/);
    if (!frMatch) continue;
    
    const baseField = frMatch[1];
    const frValue = frMatch[2];
    
    // Look backwards for the English base field
    let enValue = null;
    for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
      const enMatch = lines[j].match(new RegExp(`^\\s*${baseField}:\\s*'((?:[^'\\\\]|\\\\.)*?)'`));
      if (enMatch) {
        enValue = enMatch[1];
        break;
      }
    }
    
    if (!enValue) continue;
    
    // If Fr value equals English value, it's untranslated
    if (frValue === enValue) {
      remaining.push({
        line: i + 1,
        field: baseField + 'Fr',
        en: enValue,
      });
    }
  }
  
  if (remaining.length > 0) {
    console.log(`\n=== ${filePath} (${remaining.length} untranslated) ===`);
    remaining.forEach(r => {
      console.log(`  L${r.line}: ${r.field}`);
      console.log(`    EN: "${r.en.substring(0, 120)}"`);
    });
  }
  
  return remaining;
}

const all = [];
all.push(...findRemaining('src/Data/mockData.js'));
all.push(...findRemaining('src/Data/comprehensiveMockData.js'));
all.push(...findRemaining('src/Data/massiveMockData.js'));
console.log(`\nTotal untranslated (EN=FR): ${all.length}`);
