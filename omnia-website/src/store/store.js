import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import AuthSlice from './slices/AuthSlice'
import homeReducer from './slices/homeSlice'
import notificationsReducer from './slices/notificationsSlice'
import bookingsReducer from './slices/bookingsSlice'
import venueDetailReducer from './slices/venueDetailSlice'

// Only auth is persisted to localStorage (token must survive page refresh)
// home, notifications, bookings are in-memory: fast during navigation, fresh on page reload
const persistConfig = {
  key: 'omia-website-root',
  storage,
  whitelist: ['auth'],
}

const allReducers = combineReducers({
  auth: AuthSlice,
  home: homeReducer,
  notifications: notificationsReducer,
  bookings: bookingsReducer,
  venueDetail: venueDetailReducer,
})

const rootReducer = (state, action) => {
  if (action.type === 'auth/logout') {
    state = undefined
  }
  return allReducers(state, action)
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

const persistor = persistStore(store)

export { store, persistor }
