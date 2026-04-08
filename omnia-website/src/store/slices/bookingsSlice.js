import { createSlice } from '@reduxjs/toolkit';

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    activeBookings: [],
    pastBookings: [],
    walkInRedemptions: [],
    lastFetched: null, // timestamp ms
    walkInLastFetched: null,
  },
  reducers: {
    setBookings(state, action) {
      state.activeBookings = action.payload.activeBookings;
      state.pastBookings = action.payload.pastBookings;
      state.lastFetched = Date.now();
    },
    setWalkInRedemptions(state, action) {
      state.walkInRedemptions = action.payload;
      state.walkInLastFetched = Date.now();
    },
    addWalkInRedemption(state, action) {
      state.walkInRedemptions = [action.payload, ...state.walkInRedemptions];
    },
    updateBooking(state, action) {
      const updated = action.payload;
      // If status changed to cancelled/completed, move from active to past
      if (updated.status === 'cancelled' || updated.status === 'completed') {
        state.activeBookings = state.activeBookings.filter((b) => b.id !== updated.id);
        const existsInPast = state.pastBookings.some((b) => b.id === updated.id);
        if (existsInPast) {
          state.pastBookings = state.pastBookings.map((b) => (b.id === updated.id ? { ...b, ...updated } : b));
        } else {
          state.pastBookings = [updated, ...state.pastBookings];
        }
      } else {
        const updateIn = (list) => list.map((b) => (b.id === updated.id ? { ...b, ...updated } : b));
        state.activeBookings = updateIn(state.activeBookings);
        state.pastBookings = updateIn(state.pastBookings);
      }
    },
    removeBooking(state, action) {
      const id = action.payload;
      state.activeBookings = state.activeBookings.filter((b) => b.id !== id);
      state.pastBookings = state.pastBookings.filter((b) => b.id !== id);
    },
    clearBookings(state) {
      state.activeBookings = [];
      state.pastBookings = [];
      state.walkInRedemptions = [];
      state.lastFetched = null;
      state.walkInLastFetched = null;
    },
  },
});

export const { setBookings, setWalkInRedemptions, addWalkInRedemption, updateBooking, removeBooking, clearBookings } = bookingsSlice.actions;

// Stale after 2 minutes
export const isBookingsStale = (lastFetched) =>
  !lastFetched || Date.now() - lastFetched > 2 * 60 * 1000;

export default bookingsSlice.reducer;
