import { createSlice } from '@reduxjs/toolkit';

const venueDetailSlice = createSlice({
  name: 'venueDetail',
  initialState: {
    // { [venueId]: { data, fetchedAt } }
    cache: {},
  },
  reducers: {
    setVenueDetail(state, action) {
      const { venueId, data } = action.payload;
      state.cache[venueId] = { data, fetchedAt: Date.now() };
    },
    clearVenueDetail(state, action) {
      delete state.cache[action.payload];
    },
    clearAllVenueDetails(state) {
      state.cache = {};
    },
  },
});

export const { setVenueDetail, clearVenueDetail, clearAllVenueDetails } = venueDetailSlice.actions;

// Stale after 2 minutes
export const isVenueDetailStale = (fetchedAt) =>
  !fetchedAt || Date.now() - fetchedAt > 2 * 60 * 1000;

export default venueDetailSlice.reducer;
