/**
 * Script to add missing getLocalizedField imports.
 * Run with: node scripts/add-imports.cjs
 */
const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, '..', 'src');

const importLine = "import { getLocalizedField } from '@/lib/localization';";

const filesToCheck = [
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

let added = 0;

filesToCheck.forEach(relPath => {
  const fullPath = path.join(srcPath, relPath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf-8');
  
  // Skip if import already exists
  if (content.includes("from '@/lib/localization'") || content.includes('from "@/lib/localization"')) {
    return;
  }
  
  // Skip if file doesn't use getLocalizedField
  if (!content.includes('getLocalizedField')) {
    return;
  }
  
  // Find the last import line
  const lines = content.split('\n');
  let lastImportLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^import\s/)) {
      lastImportLine = i;
    }
  }
  
  if (lastImportLine >= 0) {
    lines.splice(lastImportLine + 1, 0, importLine);
    fs.writeFileSync(fullPath, lines.join('\n'));
    added++;
    console.log(`  Added import to: ${relPath}`);
  }
});

console.log(`\nAdded imports to ${added} files.`);
