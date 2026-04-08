/**
 * Script to add French (Fr) fields to all mock data files.
 * Run with: node scripts/add-french-fields.js
 */
const fs = require('fs');
const path = require('path');

// Translation dictionary for common English terms → French
const translations = {
  // Category names
  'Restaurants': 'Restaurants',
  'Sports & Fitness': 'Sports et Fitness',
  'Wellness & Spa': 'Bien-être et Spa',
  'Beach & Pool Clubs': 'Clubs de Plage et Piscine',
  'Activities & Entertainment': 'Activités et Divertissement',
  
  // Subcategory names
  'Fine Dining': 'Gastronomie',
  'Casual Dining': 'Restauration Décontractée',
  'Cafés & Bakeries': 'Cafés et Boulangeries',
  'Bars & Lounges': 'Bars et Lounges',
  'Seafood': 'Fruits de Mer',
  'International': 'International',
  'Lebanese': 'Libanais',
  'Asian': 'Asiatique',
  'Italian': 'Italien',
  'French': 'Français',
  'Steakhouse': 'Steakhouse',
  'Brunch': 'Brunch',
  'Padel': 'Padel',
  'Tennis': 'Tennis',
  'Football': 'Football',
  'Basketball': 'Basketball',
  'Golf': 'Golf',
  'Swimming': 'Natation',
  'Yoga & Pilates': 'Yoga et Pilates',
  'Gym & CrossFit': 'Gym et CrossFit',
  'Martial Arts': 'Arts Martiaux',
  'Spa & Massage': 'Spa et Massage',
  'Hair & Beauty': 'Coiffure et Beauté',
  'Nail Salon': 'Salon de Manucure',
  'Facial & Skincare': 'Soins du Visage',
  'Holistic Therapy': 'Thérapie Holistique',
  'Medical Spa': 'Spa Médical',
  'Beach Clubs': 'Clubs de Plage',
  'Pool Clubs': 'Clubs de Piscine',
  'Water Sports': 'Sports Nautiques',
  'Marina & Yacht': 'Marina et Yacht',
  'Kids Activities': 'Activités pour Enfants',
  'Adventure Parks': 'Parcs d\'Aventure',
  'Cultural Experiences': 'Expériences Culturelles',
  'Escape Rooms': 'Salles d\'Évasion',
  'Bowling & Gaming': 'Bowling et Jeux',

  // Location terms
  'Downtown Beirut': 'Centre-ville de Beyrouth',
  'Achrafieh, Beirut': 'Achrafieh, Beyrouth',
  'Hamra, Beirut': 'Hamra, Beyrouth',
  'Verdun, Beirut': 'Verdun, Beyrouth',
  'Gemmayze, Beirut': 'Gemmayzé, Beyrouth',
  'Mar Mikhael, Beirut': 'Mar Mikhaël, Beyrouth',
  'Byblos Harbor, Jbeil': 'Port de Byblos, Jbeil',
  'Minet El Hosn, Beirut': 'Minet El Hosn, Beyrouth',
  'Clemenceau, Beirut': 'Clemenceau, Beyrouth',
  'Manara, Beirut': 'Manara, Beyrouth',
  'Sodeco, Beirut': 'Sodeco, Beyrouth',
  'BIEL, Beirut': 'BIEL, Beyrouth',
  'Dbayeh': 'Dbayé',
  'Jounieh': 'Jounieh',
  'Jal El Dib': 'Jal El Dib',
  'Zaitunay Bay, Beirut': 'Baie de Zaitunay, Beyrouth',
  'Batroun': 'Batroun',
  'Faraya': 'Faraya',
  'ABC Achrafieh': 'ABC Achrafieh',
  'JBR, Dubai': 'JBR, Dubaï',
  'DIFC, Dubai': 'DIFC, Dubaï',
  'Business Bay, Dubai': 'Business Bay, Dubaï',
  'Al Quoz, Dubai': 'Al Quoz, Dubaï',
  'Downtown Dubai': 'Centre-ville de Dubaï',
  'Palm Jumeirah, Dubai': 'Palm Jumeirah, Dubaï',
  'Dubai Marina': 'Marina de Dubaï',
  'Al Barsha, Dubai': 'Al Barsha, Dubaï',

  // Venue descriptions
  'Iconic Mediterranean fine dining with panoramic Beirut views': 'Gastronomie méditerranéenne emblématique avec vue panoramique sur Beyrouth',
  'Premium beachfront resort with infinity pool and beach access': 'Resort premium en bord de mer avec piscine à débordement et accès à la plage',
  'Professional padel courts with coaching and tournament facilities': 'Courts de padel professionnels avec coaching et installations de tournoi',
  'Luxury spa and wellness center with authentic hammam': 'Spa et centre de bien-être de luxe avec hammam authentique',
  'Exclusive beach club with infinity pool overlooking the Mediterranean': 'Club de plage exclusif avec piscine à débordement surplombant la Méditerranée',
  'Classic French restaurant with seasonal menus': 'Restaurant français classique avec menus saisonniers',
  'Pan-Asian cuisine fusion': 'Cuisine fusion pan-asiatique',
  'Iconic rooftop lounge with panoramic views': 'Lounge iconique sur le toit avec vues panoramiques',
  'Historic Beirut coffee house': 'Café historique de Beyrouth',
  'Premium athletic club': 'Club sportif premium',
  'Modern padel courts': 'Courts de padel modernes',
  'Boutique yoga studio': 'Studio de yoga boutique',
  'Specialized therapeutic massage center': 'Centre de massage thérapeutique spécialisé',
  'Full-service luxury salon': 'Salon de luxe tous services',
  'Exclusive pool club': 'Club de piscine exclusif',
  'Premium marina': 'Marina premium',
  'Outdoor adventure park for kids': 'Parc d\'aventure en plein air pour enfants',
  'Award-winning seafood with ocean-to-table concept': 'Fruits de mer primés avec concept de l\'océan à la table',
  'Modern fusion dining with molecular gastronomy': 'Cuisine fusion moderne avec gastronomie moléculaire',
  'Authentic Japanese sushi with daily fresh ingredients': 'Sushi japonais authentique avec des ingrédients frais quotidiens',
  'Premium aged steaks and fine wines in elegant setting': 'Steaks vieillis premium et vins fins dans un cadre élégant',
  'Traditional Italian cuisine with homemade pasta and wood-fired pizza': 'Cuisine italienne traditionnelle avec pâtes maison et pizza au feu de bois',
  'Rooftop lounge with panoramic view and craft cocktails': 'Lounge sur le toit avec vue panoramique et cocktails artisanaux',
  'Professional tennis courts with coaching and tournaments': 'Courts de tennis professionnels avec coaching et tournois',
  'State-of-the-art fitness center with personal training': 'Centre de fitness de pointe avec entraînement personnel',
  'Premium football facility featuring full-size and 5-a-side pitches with artificial turf': 'Installation de football premium avec terrains en taille réelle et à 5 contre 5 sur gazon artificiel',
  'Professional basketball courts featuring indoor and outdoor play': 'Courts de basketball professionnels avec jeu intérieur et extérieur',

  // Perk titles
  'Complimentary Welcome Drink': 'Boisson de Bienvenue Offerte',
  'Free Dessert on First Visit': 'Dessert Gratuit lors de la Première Visite',
  'Complimentary Valet Parking': 'Service Voiturier Offert',
  'Free Welcome Appetizer': 'Amuse-bouche de Bienvenue Offert',
  'Happy Hour Extended': 'Happy Hour Prolongé',
  'Free Sunbed Upgrade': 'Surclassement Transats Offert',
  'Complimentary Beach Towels': 'Serviettes de Plage Offertes',
  'Kids Play Free': 'Jeux Gratuits pour les Enfants',
  'First Paddle Free': 'Première Partie de Padel Offerte',
  'Equipment Included': 'Équipement Inclus',
  'Free Herbal Tea': 'Thé aux Herbes Offert',
  'Loyalty Points Double': 'Points de Fidélité Doublés',
  'Early Bird Special': 'Offre Spéciale Matinale',
  'Free Match Ball': 'Ballon de Match Offert',
  'Changing Rooms & Showers': 'Vestiaires et Douches',
  'Evening Prime Time Perk': 'Avantage Prime Time du Soir',
  'Midweek Special': 'Offre Spéciale en Semaine',
  'Free Intro Session': 'Session d\'Introduction Gratuite',
  'Free Day Pass': 'Pass Journée Gratuit',
  'Birthday Package': 'Forfait Anniversaire',
  'Sunset Cruise Package': 'Forfait Croisière au Coucher du Soleil',
  '20% Off First Visit': 'Réduction de 20% pour la Première Visite',
  'Ladies Night': 'Soirée Dames',
  'Free Pastry': 'Pâtisserie Offerte',
  'Free Welcome Drink': 'Boisson de Bienvenue Offerte',
  'Free Miso Soup': 'Soupe Miso Offerte',
  '20% Off Premium Sake': 'Réduction de 20% sur le Saké Premium',
  'Green Tea Ice Cream': 'Glace au Thé Vert',
  'Complimentary Appetizer': 'Amuse-bouche Offert',
  'Free Wine Bottle': 'Bouteille de Vin Offerte',
  'Dessert Platter': 'Plateau de Desserts',
  '30% Off All Steaks - Today Only!': 'Réduction de 30% sur tous les Steaks - Aujourd\'hui seulement !',
  'Free Bruschetta': 'Bruschetta Offerte',
  'Limoncello Digestif': 'Digestif Limoncello',
  '15% Off Pizza Orders': 'Réduction de 15% sur les Pizzas',
  'Welcome Cocktail': 'Cocktail de Bienvenue',
  'Happy Hour Prices': 'Tarifs Happy Hour',
  'Premium Nuts & Olives': 'Noix et Olives Premium',
  'Buy 1 Get 1 Cocktails This Week!': 'Cocktails 1 acheté 1 offert cette semaine !',
  'Free Court Session': 'Session Court Gratuite',
  '20% Off Training Package': 'Réduction de 20% sur le Forfait Entraînement',
  'Equipment Rental': 'Location d\'Équipement',
  'Free Trial Day': 'Jour d\'Essai Gratuit',
  '20% Off Monthly Membership': 'Réduction de 20% sur l\'Abonnement Mensuel',
  'Free Personal Training Session': 'Session d\'Entraînement Personnel Gratuite',

  // Perk descriptions
  'Signature cocktail upon arrival': 'Cocktail signature à l\'arrivée',
  'Chef\'s seasonal dessert selection': 'Sélection de desserts saisonniers du chef',
  'Complimentary parking service': 'Service de stationnement offert',
  'Fresh mezze platter to start': 'Plateau de mezzé frais pour commencer',
  'Extended happy hour 4-8pm': 'Happy hour prolongé de 16h à 20h',
  'Premium beachfront sunbed': 'Transat premium en bord de mer',
  'Luxury towel service included': 'Service de serviettes de luxe inclus',
  'Free kids zone access': 'Accès gratuit à la zone enfants',
  'Introductory padel session free': 'Session d\'introduction au padel gratuite',
  'Rackets and balls provided': 'Raquettes et balles fournies',
  'Post-treatment herbal tea': 'Thé aux herbes après le traitement',
  '2x points on all services': 'Points doublés sur tous les services',
  '30% off before 10am': 'Réduction de 30% avant 10h',
  'Professional match ball provided for all bookings': 'Ballon de match professionnel fourni pour toutes les réservations',
  'Full facilities including changing rooms and hot showers': 'Installations complètes avec vestiaires et douches chaudes',
  'Free referee service for evening bookings': 'Service d\'arbitre gratuit pour les réservations du soir',
  '15% discount on Tuesday and Wednesday bookings': 'Réduction de 15% sur les réservations du mardi et mercredi',
  'Welcome drink': 'Boisson de bienvenue',
  'Free cocktails for ladies': 'Cocktails gratuits pour les dames',
  'Pastry with coffee': 'Pâtisserie avec le café',
  'Day pass for new visitors': 'Pass journée pour les nouveaux visiteurs',
  'Free first class': 'Premier cours gratuit',
  'New clients get discount': 'Réduction pour les nouveaux clients',
  'Private sunset cruise experience': 'Expérience de croisière privée au coucher du soleil',
  'Traditional miso soup for every guest': 'Soupe miso traditionnelle pour chaque invité',
  'On orders above $150': 'Sur les commandes de plus de 150$',
  'Complimentary dessert': 'Dessert offert',
  'Chef\'s special appetizer selection': 'Sélection d\'amuse-bouches spéciaux du chef',
  'For groups of 4 or more': 'Pour les groupes de 4 personnes ou plus',
  'Premium dessert selection': 'Sélection de desserts premium',
  'Flash discount on all premium cuts': 'Réduction flash sur toutes les pièces premium',
  'Tomato bruschetta upon arrival': 'Bruschetta aux tomates à l\'arrivée',
  'Traditional limoncello after meal': 'Limoncello traditionnel après le repas',
  'On pizza orders above $50': 'Sur les commandes de pizza de plus de 50$',
  'Signature cocktail upon arrival': 'Cocktail signature à l\'arrivée',
  'Valid 5 PM - 8 PM daily': 'Valide de 17h à 20h tous les jours',
  'Complimentary bar snacks': 'Amuse-bouches de bar offerts',
  'Buy one get one free on all cocktails': 'Un cocktail acheté, un offert',
  'Free court session for new visitors': 'Session court gratuite pour les nouveaux visiteurs',
  'For 10+ session bookings': 'Pour les réservations de 10 sessions ou plus',
  'Free racket and ball rental': 'Location gratuite de raquette et balles',
  'Full day access for first-time visitors': 'Accès journée complète pour les premiers visiteurs',
  'For 6+ month commitments': 'Pour les engagements de 6 mois ou plus',
  'One-on-one session with certified trainer': 'Session individuelle avec un entraîneur certifié',

  // Resource names
  'Table 1 - Terrace': 'Table 1 - Terrasse',
  'Table 2 - Indoor Premium': 'Table 2 - Intérieur Premium',
  'Table 3 - Private Dining': 'Table 3 - Salle Privée',
  'Table 4 - Bar Seating': 'Table 4 - Places au Bar',
  'Pool Deck A - Premium': 'Deck Piscine A - Premium',
  'Pool Deck B - Family': 'Deck Piscine B - Famille',
  'Beach Cabana 1': 'Cabana Plage 1',
  'Beach Cabana 2': 'Cabana Plage 2',
  'VIP Lounge': 'Salon VIP',
  'Court 1 - Main': 'Court 1 - Principal',
  'Court 2 - Premium': 'Court 2 - Premium',
  'Court 3 - Practice': 'Court 3 - Entraînement',
  'Treatment Room 1 - Royal Hammam': 'Salle de Soins 1 - Hammam Royal',
  'Treatment Room 2 - Couples Suite': 'Salle de Soins 2 - Suite Couples',
  'Treatment Room 3 - Aromatherapy': 'Salle de Soins 3 - Aromathérapie',
  'Relaxation Lounge': 'Salon de Détente',
  'Full-Size Pitch 1 - Premium': 'Terrain Taille Réelle 1 - Premium',
  'Full-Size Pitch 2': 'Terrain Taille Réelle 2',
  '5-a-side Pitch 1': 'Terrain 5 contre 5 - 1',
  '5-a-side Pitch 2': 'Terrain 5 contre 5 - 2',
  '5-a-side Pitch 3': 'Terrain 5 contre 5 - 3',
  'Main Arena - Indoor': 'Arène Principale - Intérieur',
  'Outdoor Court 1': 'Court Extérieur 1',
  'Outdoor Court 2': 'Court Extérieur 2',
  'Training Court': 'Court d\'Entraînement',
};

// Process a single file
function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const result = [];
  
  // Track the last English value for each field
  let lastEnglishValues = {};
  
  const fieldNames = ['name', 'title', 'description', 'location', 'venueName', 'label', 'range', 'message', 'time', 'review', 'question', 'answer', 'value', 'badgeText'];
  const fieldPattern = fieldNames.join('|');
  
  // Build regex for English fields
  const enRegex = new RegExp(`^(\\s+)(${fieldPattern}):\\s*['\`"](.+?)['\`"]`);
  // Build regex for Arabic fields
  const arRegex = new RegExp(`^(\\s+)(${fieldPattern})Ar:\\s*['\`"](.+?)['\`"]`);
  // Check if next line already has Fr field (to avoid duplicates)
  const frRegex = new RegExp(`^(\\s+)(${fieldPattern})Fr:`);
  
  let frFieldsAdded = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    result.push(line);
    
    // Track English field values
    const enMatch = line.match(enRegex);
    if (enMatch) {
      lastEnglishValues[enMatch[2]] = enMatch[3];
    }
    
    // After an Ar field, add Fr field
    const arMatch = line.match(arRegex);
    if (arMatch) {
      const indent = arMatch[1];
      const fieldName = arMatch[2];
      
      // Check if next line already has the Fr field
      if (i + 1 < lines.length && frRegex.test(lines[i + 1]) && lines[i + 1].includes(`${fieldName}Fr:`)) {
        continue; // Skip, Fr field already exists
      }
      
      // Get the English value for this field
      const englishValue = lastEnglishValues[fieldName] || '';
      
      // Look up French translation, fall back to English
      let frenchValue = translations[englishValue] || englishValue;
      
      // Escape single quotes in the French value
      frenchValue = frenchValue.replace(/'/g, "\\'");
      
      // Determine the quote character used in the Ar line
      const quoteMatch = line.match(/:\s*(['"`])/);
      const quote = quoteMatch ? quoteMatch[1] : "'";
      
      // Determine line ending (comma or not)
      const hasComma = line.trimEnd().endsWith(',');
      const comma = hasComma ? ',' : '';
      
      result.push(`${indent}${fieldName}Fr: ${quote}${frenchValue}${quote}${comma}`);
      frFieldsAdded++;
    }
  }
  
  fs.writeFileSync(filePath, result.join('\n'));
  console.log(`  Added ${frFieldsAdded} French fields`);
}

// Process all data files
const basePath = path.resolve(__dirname, '..', 'src', 'Data');
const files = ['mockData.js', 'comprehensiveMockData.js', 'massiveMockData.js'];

files.forEach(file => {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    processFile(filePath);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('\nDone! French fields added to all data files.');
