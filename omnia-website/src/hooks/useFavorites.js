import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { fetchData } from '@/helpers/fetchData';
import toast from 'react-hot-toast';

const FAVORITES_KEY = 'omnia-favorites';

export function useFavorites() {
  const token = useSelector((state) => state.auth?.token);
  const hasSyncedRef = useRef(false);
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever favoriteIds changes
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  // Sync favorites from API on mount when authenticated (once)
  useEffect(() => {
    if (!token || hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    const syncFromAPI = async () => {
      try {
        // Use /venue-favorites/me (paginated endpoint that returns venue objects)
        // API returns { data: [...venues], meta: { total } }
        const result = await fetchData('GET', '/venue-favorites/me?skip=0&limit=100');
        const rawData = result?.data;
        const items = Array.isArray(rawData) ? rawData : (rawData?.items || rawData || []);
        if (Array.isArray(items)) {
          const ids = items
            .map((item) => item.venue_id || item.id)
            .filter(Boolean);
          setFavoriteIds(ids);
        }
      } catch {
        // Keep local favorites on error
      }
    };
    syncFromAPI();
  }, [token]);

  // Clear favorites when user logs out
  useEffect(() => {
    if (!token) {
      hasSyncedRef.current = false;
    }
  }, [token]);

  const isFavorite = useCallback(
    (venueId) => favoriteIds.includes(venueId),
    [favoriteIds]
  );

  // Sync a specific venue's favorite status from API response
  // Call this when venue detail API returns is_favorite field
  const syncFromApi = useCallback((venueId, isFav) => {
    if (isFav === undefined || isFav === null) return;
    setFavoriteIds((prev) => {
      const exists = prev.includes(venueId);
      if (isFav && !exists) return [...prev, venueId];
      if (!isFav && exists) return prev.filter((id) => id !== venueId);
      return prev;
    });
  }, []);

  const toggleFavorite = useCallback(
    async (venueId) => {
      const currentlyFavorite = favoriteIds.includes(venueId);
      const newState = !currentlyFavorite;

      // Optimistic update
      setFavoriteIds((prev) =>
        newState
          ? [...prev, venueId]
          : prev.filter((id) => id !== venueId)
      );

      // Sync to API if authenticated
      if (token) {
        try {
          await fetchData('POST', '/venue-favorites', {
            venue_id: venueId,
            is_favorite: newState,
          });
        } catch {
          // Revert on error
          setFavoriteIds((prev) =>
            newState
              ? prev.filter((id) => id !== venueId)
              : [...prev, venueId]
          );
          return; // Don't show toast on failure
        }
      }

      return newState; // Return new state for caller to show toast
    },
    [favoriteIds, token]
  );

  return {
    favoriteIds,
    isFavorite,
    toggleFavorite,
    syncFromApi,
  };
}
