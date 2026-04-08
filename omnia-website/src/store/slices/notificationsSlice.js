import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    total: 0,
    lastFetched: null, // timestamp ms
  },
  reducers: {
    setNotifications(state, action) {
      state.items = action.payload.items;
      state.total = action.payload.total;
      state.lastFetched = Date.now();
    },
    appendNotifications(state, action) {
      state.items = [...state.items, ...action.payload.items];
      state.total = action.payload.total;
    },
    markNotificationRead(state, action) {
      const id = action.payload;
      const n = state.items.find((n) => n.id === id);
      if (n) n.isRead = true;
    },
    markAllNotificationsRead(state) {
      state.items = state.items.map((n) => ({ ...n, isRead: true }));
    },
    clearNotifications(state) {
      state.items = [];
      state.total = 0;
      state.lastFetched = null;
    },
  },
});

export const {
  setNotifications,
  appendNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} = notificationsSlice.actions;

// Stale after 2 minutes
export const isNotificationsStale = (lastFetched) =>
  !lastFetched || Date.now() - lastFetched > 2 * 60 * 1000;

export default notificationsSlice.reducer;
