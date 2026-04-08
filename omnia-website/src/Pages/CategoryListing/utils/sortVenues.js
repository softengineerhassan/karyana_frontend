export function sortVenues(venues) {
  const sorted = [...venues].sort((a, b) => {
    const aDynamic = a.perks.some(p => p.type === "dynamic" && p.status === "active");
    const bDynamic = b.perks.some(p => p.type === "dynamic" && p.status === "active");

    if (aDynamic !== bDynamic) return bDynamic - aDynamic;
    return b.isFeaturedCategory - a.isFeaturedCategory;
  });

  return {
    featured: sorted.filter(v => v.isFeaturedCategory),
    regular: sorted.filter(v => !v.isFeaturedCategory),
  };
}
