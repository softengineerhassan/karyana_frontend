/**
 * Second pass: Add French fields to single-line objects
 * (subcategories and other inline objects where name/nameAr are on the same line)
 * Run with: node scripts/add-french-inline.cjs
 */
const fs = require('fs');
const path = require('path');

// French translations for subcategory/inline names
const nameTranslations = {
  // Restaurant subcategories
  'Lebanese': 'Libanais',
  'Italian': 'Italien',
  'Japanese': 'Japonais',
  'French': 'Français',
  'Seafood': 'Fruits de Mer',
  'Steakhouse': 'Steakhouse',
  'Asian Fusion': 'Fusion Asiatique',
  'Rooftop Bar': 'Bar Rooftop',
  'Café & Bistro': 'Café et Bistro',
  'Mediterranean': 'Méditerranéen',
  'Sushi Bar': 'Bar à Sushi',
  'Fine Dining': 'Gastronomie',
  'Brunch Spot': 'Brunch',
  'Lounge & Cocktail Bar': 'Lounge et Bar à Cocktails',
  'Wine Bar': 'Bar à Vin',
  'Gastropub': 'Gastropub',
  'Middle Eastern': 'Moyen-Oriental',
  'Vegan & Healthy': 'Végétalien et Sain',
  
  // Sports subcategories
  'Padel': 'Padel',
  'Tennis': 'Tennis',
  'Football': 'Football',
  'Basketball': 'Basketball',
  'Golf': 'Golf',
  'Swimming': 'Natation',
  'Yoga': 'Yoga',
  'CrossFit': 'CrossFit',
  'Martial Arts': 'Arts Martiaux',
  'Running': 'Course à Pied',
  'Cycling': 'Cyclisme',
  'Boxing': 'Boxe',
  'Table Tennis': 'Tennis de Table',
  'Volleyball': 'Volleyball',
  'Cricket': 'Cricket',
  'Badminton': 'Badminton',
  'Squash': 'Squash',
  'Ice Skating': 'Patinage sur Glace',
  
  // Wellness subcategories
  'Spa & Hammam': 'Spa et Hammam',
  'Massage Therapy': 'Massothérapie',
  'Meditation': 'Méditation',
  'Hair Salon': 'Salon de Coiffure',
  'Nail Studio': 'Studio d\'Ongles',
  'Skin Care': 'Soins de la Peau',
  'Aromatherapy': 'Aromathérapie',
  'Acupuncture': 'Acupuncture',
  'Chiropractic': 'Chiropratique',
  'Dental Wellness': 'Bien-être Dentaire',
  'Eye Care': 'Soins Oculaires',
  'Nutrition': 'Nutrition',
  'Mental Health': 'Santé Mentale',
  'Physiotherapy': 'Physiothérapie',
  'Pilates': 'Pilates',
  'Reflexology': 'Réflexologie',
  'Reiki': 'Reiki',
  'Sound Therapy': 'Sonothérapie',
  
  // Beach & Pool
  'Beach Club': 'Club de Plage',
  'Pool Club': 'Club de Piscine',
  'Water Park': 'Parc Aquatique',
  'Marina': 'Marina',
  'Yacht Club': 'Yacht Club',
  'Surf School': 'École de Surf',
  'Diving Center': 'Centre de Plongée',
  'Fishing': 'Pêche',
  'Kayaking': 'Kayak',
  'Jet Ski': 'Jet Ski',
  'Sailing': 'Voile',
  'Paddleboarding': 'Paddleboard',
  'Snorkeling': 'Snorkeling',
  'Kitesurfing': 'Kitesurf',
  'Wakeboarding': 'Wakeboard',
  'Parasailing': 'Parachute Ascensionnel',
  'Boat Tour': 'Tour en Bateau',
  'Aqua Park': 'Parc Aquatique',
  
  // Activities & Entertainment
  'Theme Parks': 'Parcs à Thème',
  'Escape Rooms': 'Salles d\'Évasion',
  'Bowling': 'Bowling',
  'Cinema': 'Cinéma',
  'Game Center': 'Centre de Jeux',
  'Go-Karting': 'Karting',
  'Laser Tag': 'Laser Tag',
  'Paintball': 'Paintball',
  'Trampoline Park': 'Parc de Trampolines',
  'VR Experience': 'Expérience VR',
  'Art Workshop': 'Atelier d\'Art',
  'Music Studio': 'Studio de Musique',
  'Cooking Class': 'Cours de Cuisine',
  'Dance Class': 'Cours de Danse',
  'Photography Tour': 'Tour Photographique',
  'Wine Tasting': 'Dégustation de Vin',
  'Zip Line': 'Tyrolienne',
  'Rock Climbing': 'Escalade',
};

function processInlineFields(filePath) {
  console.log(`Processing inline fields: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  let fieldsAdded = 0;
  
  // Pattern: name: 'xxx', nameAr: 'yyy', (without nameFr after it)
  // This handles all bilingual field pairs on the same line
  const fieldNames = ['name', 'title', 'description', 'location', 'venueName', 'label', 'range', 'message', 'time', 'review', 'question', 'answer', 'value', 'badgeText'];
  
  for (const field of fieldNames) {
    // Match: field: 'value', fieldAr: 'valueAr', (NOT followed by fieldFr)
    const regex = new RegExp(
      `(${field}:\\s*'([^']*)',\\s*)(${field}Ar:\\s*'[^']*',)(?!\\s*${field}Fr:)`,
      'g'
    );
    
    content = content.replace(regex, (match, enPart, enValue, arPart) => {
      const frValue = nameTranslations[enValue] || enValue;
      const escapedFr = frValue.replace(/'/g, "\\'");
      fieldsAdded++;
      return `${enPart}${arPart} ${field}Fr: '${escapedFr}',`;
    });
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`  Added ${fieldsAdded} inline French fields`);
}

const basePath = path.resolve(__dirname, '..', 'src', 'Data');
const files = ['mockData.js', 'comprehensiveMockData.js', 'massiveMockData.js'];

files.forEach(file => {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    processInlineFields(filePath);
  }
});

console.log('\nDone! Inline French fields added.');
