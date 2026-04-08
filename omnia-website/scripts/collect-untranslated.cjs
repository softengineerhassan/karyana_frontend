const fs = require('fs');

// Collect all unique English values that appear in Fr fields unchanged
function collectUntranslated(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const untranslated = {};
  
  for (let i = 0; i < lines.length; i++) {
    const frMatch = lines[i].match(/^\s*(\w+)Fr:\s*'((?:[^'\\]|\\.)*?)'/);
    if (!frMatch) continue;
    
    const baseField = frMatch[1]; // e.g. 'name', 'title', 'description'
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
    
    // Check if Fr value looks untranslated (same as English or no French chars)
    const isFrench = /[àâãäéèêëïîôùûüÿçœæÀÂÃÄÉÈÊËÏÎÔÙÛÜŸÇŒÆ]/.test(frValue) ||
      /\b(de |du |des |la |le |les |en |et |ou |un |une |sur |avec |pour |dans |aux |Offert|Gratuit|Sélection)\b/i.test(frValue);
    
    if (!isFrench || frValue === enValue) {
      const key = `${baseField}|||${enValue}`;
      if (!untranslated[key]) {
        untranslated[key] = { field: baseField, en: enValue, files: [], lines: [] };
      }
      untranslated[key].files.push(filePath);
      untranslated[key].lines.push(i + 1);
    }
  }
  
  return untranslated;
}

const all = {};
['src/Data/mockData.js', 'src/Data/comprehensiveMockData.js', 'src/Data/massiveMockData.js'].forEach(f => {
  const result = collectUntranslated(f);
  Object.keys(result).forEach(k => {
    if (!all[k]) all[k] = result[k];
    else {
      all[k].files.push(...result[k].files);
      all[k].lines.push(...result[k].lines);
    }
  });
});

// Group by field type
const grouped = {};
Object.values(all).forEach(v => {
  if (!grouped[v.field]) grouped[v.field] = [];
  grouped[v.field].push(v.en);
});

Object.keys(grouped).sort().forEach(field => {
  console.log(`\n=== ${field} (${grouped[field].length} values) ===`);
  grouped[field].forEach(v => console.log(`  "${v.substring(0, 100)}"`));
});

console.log(`\nTotal unique untranslated values: ${Object.keys(all).length}`);
