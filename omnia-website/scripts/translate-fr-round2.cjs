const fs = require('fs');

// Round 2: Additional translations for longer/exact strings that didn't match in round 1
const translations = {
  // Long descriptions with slight variations
  'Contemporary Lebanese cuisine with stunning Mediterranean views. Experience elevated traditional flavors in an architectural masterpiece.':
    'Cuisine libanaise contemporaine avec des vues magnifiques sur la Méditerranée. Découvrez des saveurs traditionnelles sublimées dans un chef-d\'œuvre architectural.',
  
  'Exclusive Mediterranean beach club featuring private cabanas, infinity pools, and world-class dining. A luxury escape just minutes from Beirut.':
    'Club de plage méditerranéen exclusif avec cabanes privées, piscines à débordement et restauration de classe mondiale. Une escapade de luxe à quelques minutes de Beyrouth.',
  
  'Authentic Lebanese home cooking showcasing regional recipes from different villages daily. Farm-to-table concept with ingredients sourced from local producers.':
    'Cuisine libanaise authentique mettant en valeur les recettes régionales de différents villages chaque jour. Concept de la ferme à la table avec des ingrédients des producteurs locaux.',

  'Premier padel facility with 6 professional courts, coaching programs, and exclusive member lounge. Host of national tournaments.':
    'Installation de padel premier choix avec 6 courts professionnels, programmes de coaching et salon exclusif pour les membres. Hôte de tournois nationaux.',

  'Michelin-star trained chefs craft seasonal Italian menus using imported ingredients in an elegant intimate setting.':
    'Des chefs formés dans des restaurants étoilés Michelin élaborent des menus italiens saisonniers avec des ingrédients importés dans un cadre élégant et intime.',
    
  'Fine Italian dining with theatrical presentation and live pasta-making shows. A culinary experience for all senses.':
    'Restaurant italien raffiné avec présentation théâtrale et démonstrations de fabrication de pâtes en direct. Une expérience culinaire pour tous les sens.',
    
  'Contemporary Japanese fusion with premium omakase experiences and signature rolls. Minimalist elegance meets culinary artistry.':
    'Fusion japonaise contemporaine avec des expériences omakase premium et des rouleaux signature. L\'élégance minimaliste rencontre l\'art culinaire.',
    
  'Authentic Japanese izakaya experience with yakitori, ramen, and craft sake. Casual elegance in the heart of Gemmayzeh.':
    'Expérience authentique d\'izakaya japonais avec yakitori, ramen et saké artisanal. Élégance décontractée au cœur de Gemmayzeh.',
    
  'Fresh seafood, craft beer, and authentic Lebanese hospitality in historic old town. Live music on weekends.':
    'Fruits de mer frais, bière artisanale et hospitalité libanaise authentique dans la vieille ville historique. Musique live le week-end.',
    
  'Iconic Batroun beach club offering crystal-clear waters, gourmet dining, and legendary sunsets. The ultimate summer destination.':
    'Club de plage emblématique de Batroun offrant des eaux cristallines, une cuisine gastronomique et des couchers de soleil légendaires. La destination estivale ultime.',
    
  'Exclusive beach resort with private cabanas, infinity pool, and sunset lounge. Paradise on the Lebanese coast.':
    'Resort de plage exclusif avec cabanes privées, piscine à débordement et salon coucher de soleil. Un paradis sur la côte libanaise.',
    
  'State-of-the-art fitness facility with personal training and group classes. Transform your body, elevate your life.':
    'Centre de fitness ultramoderne avec coaching personnel et cours collectifs. Transformez votre corps, élevez votre vie.',
    
  'Luxury spa offering oriental treatments, hammam, and holistic therapies. Your sanctuary of serenity.':
    'Spa de luxe proposant des soins orientaux, hammam et thérapies holistiques. Votre sanctuaire de sérénité.',
    
  'Authentic Italian trattoria with homemade pasta and wood-fired pizzas. A taste of Italy in Saifi Village.':
    'Trattoria italienne authentique avec pâtes maison et pizzas au feu de bois. Un goût d\'Italie au Village de Saifi.',
    
  'Premium Japanese dining with master sushi chefs and omakase experience. The finest Japanese cuisine in Beirut.':
    'Restaurant japonais premium avec maîtres sushi et expérience omakase. La meilleure cuisine japonaise de Beyrouth.',
    
  'Premium cuts of aged beef with spectacular ocean views. The ultimate steakhouse experience.':
    'Coupes premium de bœuf maturé avec des vues spectaculaires sur l\'océan. L\'expérience steakhouse ultime.',
    
  'Exclusive beach club with luxury cabanas and infinity pools. Your private Mediterranean retreat.':
    'Club de plage exclusif avec cabanes de luxe et piscines à débordement. Votre retraite méditerranéenne privée.',
    
  'Professional tennis courts with coaching and tournament facilities. Where champions are made.':
    'Courts de tennis professionnels avec coaching et installations de tournoi. Là où naissent les champions.',
    
  'World-class spa with holistic treatments and ocean views. Complete mind and body rejuvenation.':
    'Spa de classe mondiale avec soins holistiques et vue sur l\'océan. Rajeunissement complet du corps et de l\'esprit.',
    
  'Premium indoor play center with educational activities and supervision. Where kids learn through play.':
    'Centre de jeux intérieur premium avec activités éducatives et encadrement. Là où les enfants apprennent en jouant.',

  'Premier padel facility with professional-grade courts, coaching, and pro shop.':
    'Installation de padel premier choix avec courts de niveau professionnel, coaching et boutique pro.',

  'State-of-the-art basketball facility with NBA-standard courts and professional amenities.':
    'Installation de basketball ultramoderne avec courts aux normes NBA et équipements professionnels.',
    
  'Complimentary free referee service for evening bookings':
    'Service d\'arbitre gratuit offert pour les réservations du soir',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  for (const [english, french] of Object.entries(translations)) {
    // Escape special regex characters in the English text
    const escapedEn = english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match the Fr field with this exact English value
    const regex = new RegExp(`(\\w+Fr:\\s*')${escapedEn}(')`, 'g');
    const escaped = french.replace(/'/g, "\\'");
    const newContent = content.replace(regex, `$1${escaped}$2`);
    if (newContent !== content) {
      const count = (content.match(regex) || []).length;
      changes += count;
      content = newContent;
    }
  }
  
  if (changes > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`${filePath}: ${changes} additional fields translated`);
  } else {
    console.log(`${filePath}: no additional changes`);
  }
  return changes;
}

let total = 0;
total += processFile('src/Data/mockData.js');
total += processFile('src/Data/comprehensiveMockData.js');
total += processFile('src/Data/massiveMockData.js');
console.log(`\nTotal: ${total} additional fields translated`);
