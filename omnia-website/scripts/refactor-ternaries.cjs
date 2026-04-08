/**
 * Script to refactor all bilingual ternary patterns to use getLocalizedField().
 * 
 * Replaces:
 *   language === 'en' ? obj.field : obj.fieldAr  → getLocalizedField(obj, 'field', language)
 *   language === "en" ? obj.field : obj.fieldAr   → getLocalizedField(obj, 'field', language)
 *   language === "ar" ? obj.fieldAr : obj.field   → getLocalizedField(obj, 'field', language)
 * 
 * Also adds the import statement for getLocalizedField where needed.
 * 
 * Run with: node scripts/refactor-ternaries.cjs
 */
const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, '..', 'src');

// Files that need refactoring (from the comprehensive search)
const filesToRefactor = [
  'Shared/WalkInPerkModal.jsx',
  'Pages/Home/components/FlippableVenueCard.jsx',
  'Pages/Booking/components/RestaurantBookingFlow.jsx',
  'Pages/Home/components/PerkActionModal.jsx',
  'Pages/Profile/HelpSupport.jsx',
  'Pages/Booking/components/ResortBookingFlow.jsx',
  'Pages/VenueProfile/components/VenuePerks.jsx',
  'Pages/Booking/components/SportsBookingFlow.jsx',
  'Pages/Booking/BookingSuccess.jsx',
  'Pages/Profile/MyReviews.jsx',
  'Pages/Profile/Notifications.jsx',
  'Pages/VenueProfile/components/VenueHero.jsx',
  'Pages/Home/components/ExploreSection.jsx',
  'Pages/VenueProfile/components/VenueDescription.jsx',
  'Pages/VenueProfile/components/VenueContact.jsx',
  'Pages/VenueProfile/components/VenueResources.jsx',
  'Pages/Home/components/TrendingSection.jsx',
  'Pages/CategoryListing/CategoryListing.jsx',
  'Pages/CategoryListing/components/SubcategoryFilters.jsx',
  'Pages/MyBooking/utilis/bookingHelpers.js',
];

function refactorFile(relPath) {
  const fullPath = path.join(srcPath, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`  SKIP (not found): ${relPath}`);
    return 0;
  }
  
  let content = fs.readFileSync(fullPath, 'utf-8');
  let replacements = 0;
  
  // Pattern 1: language === 'en' ? obj.field : obj.fieldAr
  // Handles: venue.name, perk.title, resource.name, etc.
  // Also handles: colors.badgeText, dynamicPerk.title, bookingData.perk.title
  content = content.replace(
    /language\s*===\s*['"]en['"]\s*\?\s*(\w+(?:\.\w+)*)\.(\w+)\s*:\s*\1\.(\2Ar)/g,
    (match, obj, field, fieldAr) => {
      replacements++;
      return `getLocalizedField(${obj}, '${field}', language)`;
    }
  );
  
  // Pattern 1b: with || fallback: language === "en" ? v.name : v.nameAr || v.name
  content = content.replace(
    /language\s*===\s*['"]en['"]\s*\?\s*(\w+(?:\.\w+)*)\.(\w+)\s*:\s*\1\.(\2Ar)\s*\|\|\s*\1\.\2/g,
    (match, obj, field) => {
      replacements++;
      return `getLocalizedField(${obj}, '${field}', language)`;
    }
  );
  
  // Pattern 2: language === "ar" ? obj.fieldAr : obj.field (reverse direction)
  content = content.replace(
    /language\s*===\s*['"]ar['"]\s*\?\s*(\w+(?:\.\w+)*)\.(\w+)Ar\s*:\s*\1\.(\2)/g,
    (match, obj, field) => {
      replacements++;
      return `getLocalizedField(${obj}, '${field}', language)`;
    }
  );
  
  // Special pattern for WalkInPerkModal: language === 'en' ? venueName : venueNameAr (bare variables, not obj.field)
  content = content.replace(
    /language\s*===\s*['"]en['"]\s*\?\s*venueName\s*:\s*venueNameAr/g,
    () => {
      replacements++;
      return `getLocalizedField({ name: venueName, nameAr: venueNameAr, nameFr: venueNameFr }, 'name', language)`;
    }
  );
  
  // Special pattern for PerkActionModal: same bare variables  
  // Actually PerkActionModal uses props venueName/venueNameAr too — will handle below
  
  if (replacements > 0) {
    // Add import for getLocalizedField if not already present
    if (!content.includes('getLocalizedField')) {
      // Find the best place to add the import
      // Try to add after the last import statement
      const importRegex = /^import\s.+$/gm;
      let lastImportMatch;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastImportMatch = match;
      }
      
      if (lastImportMatch) {
        const insertPos = lastImportMatch.index + lastImportMatch[0].length;
        const importStatement = `\nimport { getLocalizedField } from '@/lib/localization';`;
        content = content.slice(0, insertPos) + importStatement + content.slice(insertPos);
      }
    }
    
    fs.writeFileSync(fullPath, content);
  }
  
  return replacements;
}

console.log('Refactoring bilingual ternaries to getLocalizedField()...\n');

let totalReplacements = 0;
filesToRefactor.forEach(relPath => {
  const count = refactorFile(relPath);
  if (count > 0) {
    console.log(`  ${relPath}: ${count} replacements`);
  }
  totalReplacements += count;
});

console.log(`\nTotal: ${totalReplacements} ternary patterns refactored.`);
