export function filterVenues(venues, categoryId, subcategoryId) {
  return venues.filter(v => {
    const categoryMatch = v.categoryId === categoryId;
    const subMatch = !subcategoryId || v.subcategoryId === subcategoryId;
    return categoryMatch && subMatch;
  });
}
