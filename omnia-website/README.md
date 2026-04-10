# Karyana POS Frontend (Starter)

This frontend has been cleaned to start POS implementation against your backend.

## Current Scope

Included modules:
- Auth login
- Profile setup
- Rider profiles
- Rider purchase items

Removed from active routing:
- Venue and booking flows
- Favorites and map flows
- Non-POS profile subsections

## Backend Base URL

Configured in src/config.js:
- /api/v1 in dev, proxied by Vite to http://13.236.146.72:8000

## Auth Handling

- Bearer token is injected from Redux in src/Services/setupAxios.js.
- On HTTP 401, user is logged out directly.
- Refresh-token flow is intentionally removed.

## POS Routes

- /login
- /pos/dashboard
- /pos/profile
- /pos/riders
- /pos/rider-items

## Start Development

1. Install dependencies

   npm install

2. Run app

   npm run dev

3. Ensure backend is running on port 8069

For the live backend, Vite proxies /api requests to http://13.236.146.72:8000 so the browser does not hit CORS directly.

## Next Implementation Steps

1. Build API service files for:
- /auth/me and /auth/me/profile
- /riders
- /rider-purchase-items

2. Add forms and tables on POS pages.

3. Add validation based on backend schema constraints.
