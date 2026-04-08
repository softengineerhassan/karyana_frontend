const fs = require('fs');

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let englishCount = 0;
  let frenchCount = 0;
  const englishFields = [];
  
  lines.forEach((line, idx) => {
    // Match Fr fields with string values
    const match = line.match(/^\s*(\w+Fr):\s*['"](.+?)['"]/);
    if (match) {
      const fieldName = match[1];
      const value = match[2];
      
      // Check if the value looks French (contains French chars or known French words)
      const isFrench = /[àâãäéèêëïîôùûüÿçœæÀÂÃÄÉÈÊËÏÎÔÙÛÜŸÇŒÆ]/.test(value) ||
        /\b(de |du |des |la |le |les |en |et |ou |un |une |sur |avec |pour |dans )\b/i.test(value) ||
        /\b(Gastronomie|Bien-être|Plage|Fruits|Réduction|Offert|Gratuit|Sélection|Réservation)\b/i.test(value);
      
      if (isFrench) {
        frenchCount++;
      } else {
        englishCount++;
        englishFields.push({ line: idx + 1, field: fieldName, value: value.substring(0, 80) });
      }
    }
  });
  
  console.log(`\n=== ${filePath} ===`);
  console.log(`French: ${frenchCount}, English (untranslated): ${englishCount}`);
  if (englishFields.length > 0) {
    console.log('\nUntranslated fields (first 30):');
    englishFields.slice(0, 30).forEach(f => {
      console.log(`  L${f.line}: ${f.field} = "${f.value}"`);
    });
    if (englishFields.length > 30) {
      console.log(`  ... and ${englishFields.length - 30} more`);
    }
  }
}

auditFile('src/Data/mockData.js');
auditFile('src/Data/comprehensiveMockData.js');
auditFile('src/Data/massiveMockData.js');
