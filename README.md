# Caliper Frontend

Cross-platform calorie and macro tracking client built with Expo Router, React
Native, TypeScript, and NativeWind.

## Features

- Supabase email/password authentication
- Daily calorie and macro dashboard
- Meal logs grouped by breakfast, lunch, dinner, and snacks
- Create, edit, and delete meal logs
- Native barcode scanning with Expo Camera
- Debounced USDA food search
- Open Food Facts barcode lookup
- AI plate analysis from an image
- Context-aware AI diet advisor chat
- iOS, Android, and web support

## Technology

- Expo SDK 56
- Expo Router
- React Native 0.85
- React 19
- TypeScript
- NativeWind 4 with Tailwind CSS 3
- Supabase Auth
- Expo Camera
- Expo Image Picker

## Architecture

```text
app/
  (tabs)/
    index.tsx        Dashboard route
    scan.tsx         Barcode, search, and plate analysis route
    chat.tsx         Diet advisor route

src/
  components/
    advisor/
    auth/
    dashboard/
    food/
    scan/
    ui/
  hooks/             UI state, API calls, and mutations
  lib/
    api-client.ts    Authenticated FastAPI client
    supabase.ts      Supabase browser/native client
  types/
    api.ts           Shared frontend API contracts
```

Route files remain small. Network requests, mutation state, authentication, and
complex interaction state are implemented in custom hooks.

## Requirements

- Node.js supported by Expo SDK 56
- npm
- A running Caliper backend
- A Supabase project with the backend migration applied
- Android Studio, Xcode, or Expo Go for native development

## Environment

Create `.env` from `.env.example`:

```powershell
Copy-Item .env.example .env
```

Configure:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

`EXPO_PUBLIC_SUPABASE_ANON_KEY` is intentionally public. It is the Supabase
anonymous client key, not the service-role key. Database security is enforced by
Supabase authentication and Row Level Security.

Never expose a Supabase service-role key in the frontend.

### API URL On Devices

`localhost` refers to the device itself. Use an address reachable by the target:

- Android emulator: `http://10.0.2.2:8000/api/v1`
- iOS simulator: `http://localhost:8000/api/v1`
- Physical device: `http://<development-machine-lan-ip>:8000/api/v1`

The backend `CORS_ORIGINS` setting must include the web development origin when
running Expo Web.

## Installation

```powershell
npm install
```

## Development

Start Expo:

```powershell
npm start
```

Platform-specific commands:

```powershell
npm run android
npm run ios
npm run web
```

Create a static web export:

```powershell
npm run build:web
```

## Authentication Flow

The frontend authenticates directly with Supabase. Supabase returns a user JWT,
which `src/lib/api-client.ts` automatically adds to backend requests:

```http
Authorization: Bearer <supabase-access-token>
```

FastAPI verifies that token before serving protected routes.

## Food Logging Flow

1. Scan a barcode or search for a food.
2. Select a result.
3. Choose a meal type and weight in grams.
4. The backend calculates nutrient totals from per-100 g values.
5. Returning to the dashboard refreshes server-aggregated daily totals.

Meal-log edits use optimistic UI updates and refresh the authoritative dashboard
state after the server accepts the change.

## Camera And Images

Barcode scanning requires camera permission. Plate analysis uses the image
library and sends a compressed base64 image to the backend.

Camera and photo permissions are configured in `app.json`. Native permission
changes require rebuilding the native application.

## Main Hooks

- `useAuth`: Supabase session lifecycle
- `useAuthForm`: sign-in and registration state
- `useDashboardData`: dashboard fetching and meal-log mutations
- `useFoodSearch`: debounced, cancellable USDA search
- `useBarcodeScanner`: camera permission and scan state
- `useBarcodeLookup`: Open Food Facts lookup
- `useMealLogs`: quick-log creation
- `usePlateAnalysis`: image selection and AI analysis
- `useAdvisorChat`: interactive advisor conversation

## Required Backend Routes

```text
GET    /api/v1/dashboard
POST   /api/v1/meal-logs
PATCH  /api/v1/meal-logs/{log_id}
DELETE /api/v1/meal-logs/{log_id}
GET    /api/v1/food/barcode/{barcode}
GET    /api/v1/food/search
POST   /api/v1/ai/analyze-plate
POST   /api/v1/ai/chat
```

## Troubleshooting

### Missing environment configuration

The application intentionally fails during startup when the API URL or Supabase
public credentials are absent. Confirm `.env` exists and restart Expo after
changing it.

### Camera does not open

Confirm camera permission is granted. If `app.json` permission settings changed,
rebuild the native application.

### A physical device cannot reach FastAPI

Use the development machine's LAN address instead of `localhost`, ensure both
devices are on the same network, and allow the backend port through the local
firewall.

### Dashboard is empty

Confirm the user is authenticated, the Supabase migration is applied, and the
backend can connect to the same Supabase PostgreSQL database.

