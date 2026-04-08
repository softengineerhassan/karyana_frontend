/**
 * Mirrors customer app's Venue.fromJson + _fixUrl logic exactly.
 *
 * Customer app (venue_model.dart):
 *   static String? _fixUrl(String? url) {
 *     if (url == null || url.isEmpty) return null;
 *     if (!url.startsWith('http')) {
 *       if (!url.startsWith('/')) url = '/$url';
 *       return "https://d38u4q1db9myax.cloudfront.net$url";
 *     }
 *     return url;
 *   }
 */
const CLOUDFRONT = 'https://d38u4q1db9myax.cloudfront.net';

/** Mirrors _fixUrl: prepends CloudFront domain for relative paths */
export function fixUrl(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') return null;
  if (url.startsWith('http')) return url;
  // relative path → prepend CloudFront
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${CLOUDFRONT}${path}`;
}

/**
 * Mirrors resolveImageUrl from Venue.fromJson.
 * Priority: image_cover_url → image_cover → image_logo_url →
 *           featured_image → image_url → card_image_url → gallery[0]
 * Checks core (nested venue object) first, then falls back to root.
 */
function resolveImageUrl(root, core) {
  const keys = [
    'image_cover_url',
    'image_cover',
    'image_logo_url',
    'featured_image',
    'image_url',
    'card_image_url',
  ];

  // Check core first (same as customer app)
  for (const key of keys) {
    const fixed = fixUrl(core[key]);
    if (fixed) return fixed;
  }

  // Gallery fallback — root first, then core (same as customer app)
  const gallery =
    root.image_gallery_urls ??
    root.image_gallery ??
    core.image_gallery_urls ??
    core.image_gallery;

  if (Array.isArray(gallery) && gallery.length > 0) {
    const fixed = fixUrl(gallery[0]);
    if (fixed) return fixed;
  }

  return null;
}

function mapPriceRange(value) {
  if (!value) return '$$';
  const s = value.toString().toLowerCase();
  if (s === 'budget')   return '$';
  if (s === 'moderate') return '$$';
  if (s === 'upscale')  return '$$$';
  if (s === 'luxury')   return '$$$$';
  return value;
}

/**
 * Full venue normalizer — mirrors Venue.fromJson exactly.
 * Handles both flat { id, name_en, ... } and nested { venue: { ... }, ratings_summary, ... } API shapes.
 */
export function normalizeVenueItem(json) {
  // Mirror: final core = json.containsKey('venue') ? json['venue'] : json
  const core = (json.venue && typeof json.venue === 'object') ? json.venue : json;

  // Ratings — check root first, then core (same as resolveRatingsSummary)
  const ratingsRoot = json.ratings_summary;
  const ratingsCore = core.ratings_summary;
  const avgRating =
    ratingsRoot?.average_rating ??
    ratingsCore?.average_rating ??
    json.average_rating ??
    core.average_rating ??
    json.rating ??
    core.rating ??
    null;
  const totalReviews =
    ratingsRoot?.total_reviews ??
    ratingsCore?.total_reviews ??
    json.total_reviews ??
    core.total_reviews ??
    null;

  // Pricing — check root first, then core
  const pricingRaw =
    json.pricing?.price_range ??
    core.pricing?.price_range ??
    json.price_range ??
    core.price_range ??
    null;

  return {
    id:          core.id ?? json.id,
    name:        core.name_en  || core.name  || json.name_en  || json.name  || '',
    nameAr:      core.name_ar  || json.name_ar  || '',
    nameFr:      core.name_fr  || json.name_fr  || '',
    location:    core.address_en || core.location || json.address_en || json.location || '',
    locationAr:  core.address_ar || json.address_ar || '',
    locationFr:  core.address_fr || json.address_fr || '',
    city:        core.city_en  || core.city  || json.city_en  || json.city  || '',
    image:       resolveImageUrl(json, core),
    rating:      avgRating   != null ? Number(avgRating)   : null,
    reviewCount: totalReviews != null ? Number(totalReviews) : null,
    priceRange:  mapPriceRange(pricingRaw),
    perks:       json.perks ?? core.perks ?? [],
    is_featured: core.is_featured ?? json.is_featured ?? false,
    categoryId:  core.category_id ?? core.categoryId ?? json.category_id ?? json.categoryId ?? null,
    latitude:    core.latitude  ?? json.latitude  ?? null,
    longitude:   core.longitude ?? json.longitude ?? null,
  };
}
