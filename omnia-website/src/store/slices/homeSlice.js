import { createSlice } from '@reduxjs/toolkit';

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    featuredVenues: [],
    trendingVenues: [],
    lastFetched: null, // timestamp ms
  },
  reducers: {
    setHomeData(state, action) {
      state.featuredVenues = action.payload.featuredVenues;
      state.trendingVenues = action.payload.trendingVenues;
      state.lastFetched = Date.now();
    },
    clearHomeData(state) {
      state.featuredVenues = [];
      state.trendingVenues = [];
      state.lastFetched = null;
    },
  },
});

export const { setHomeData, clearHomeData } = homeSlice.actions;

// Stale after 5 minutes
export const isHomeDataStale = (lastFetched) =>
  !lastFetched || Date.now() - lastFetched > 5 * 60 * 1000;

export default homeSlice.reducer;
