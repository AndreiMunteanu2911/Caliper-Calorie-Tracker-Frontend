# Caliper Frontend

Cross-platform calorie and macro tracking client built with Expo Router, React
Native, TypeScript, and NativeWind.

[Visit the live site](https://caliperam.vercel.app/)

## Design Credit

The visual design is inspired by
[Nutri AI Food Calorie Tracker App](https://www.figma.com/community/file/1500608399091759099/nutri-ai-food-calorie-tracker-app).

## Features

- Supabase email/password authentication
- Daily calorie and macro dashboard
- Meal logs grouped by breakfast, lunch, dinner, and snacks
- Create, edit, and delete meal logs
- Native barcode scanning with Expo Camera
- Debounced USDA food search
- Open Food Facts barcode lookup
- AI meal analysis from a camera or library image
- Context-aware AI diet advisor chat
- Persistent advisor conversations using today and 30-day nutrition context
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
  index.tsx                         Public welcome route
  sign-in.tsx                       Sign-in route
  sign-up.tsx                       Registration route
  (protected)/
    (tabs)/
      dashboard.tsx                 Dashboard route
      scan.tsx                      Barcode, search, and meal analysis route
      chat.tsx                      Diet advisor route

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

Create an uncommitted `.env.local` for machine-specific values:

```powershell
Copy-Item .env.example .env.local
```

Configure `.env.local`:

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

Start the backend first from `Caliper-Backend`:

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Then start Expo from `Caliper-Frontend`:

```powershell
npm start
```

Platform-specific commands:

```powershell
npm run android
npm run ios
npm run web
```

### Local Test Checklist

1. Open `/` and confirm the welcome page shows separate sign-in and sign-up
   actions.
2. Create an account. If Supabase email confirmation is enabled, confirm the
   email before signing in.
3. Sign in and confirm the app redirects to `/dashboard`.
4. Open **Meal Analysis** and test barcode scanning, food search, camera capture,
   and library image selection.
5. Log a food, then confirm it appears on the dashboard.
6. Edit its weight and meal type, then delete it.
7. Open **AI Advisor**, send a message, and confirm the response uses the current
   daily macro balance.
8. Sign out and confirm protected routes redirect to `/`.

For Expo Web, open the URL printed by `npm run web`, normally
`http://localhost:8081`.

In Supabase **Authentication > URL Configuration**, add the local and production
auth callback URLs to the redirect allowlist:

```text
http://localhost:8081/**
https://your-frontend.vercel.app/**
caliperfrontend:///**
```

Keep the production frontend as the Supabase Site URL. The app sends an
environment-specific email redirect when a user registers.

Create a static web export:

```powershell
npm run build:web
```

## Deploying Expo Web To Vercel

The frontend and backend are separate Vercel projects. Deploy the backend first
because its production URL is required while building the frontend.

### 1. Create The Frontend Project

Import this repository into Vercel and configure:

- Root Directory: repository root
- Framework Preset: Other
- Build Command: `npm run build:web`
- Output Directory: `dist`
- Install Command: `npm install`

`vercel.json` already contains the build and output settings.

### 2. Configure Production Variables

In Vercel Project Settings, add these variables for Production:

```env
EXPO_PUBLIC_API_URL=https://your-backend.vercel.app/api/v1
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Add equivalent values for Preview if preview deployments should work. A preview
frontend may call the production backend, or a separate staging backend.

`EXPO_PUBLIC_` values are embedded into the browser/native JavaScript bundle at
build time. They must not contain secrets.

### 3. Deploy

Push to the production branch or run:

```powershell
npx vercel --prod
```

After changing a Vercel environment variable, redeploy the frontend so Expo can
embed the new value into the web bundle.

### Environment File Strategy

Use:

- `.env.local`: uncommitted local API and Supabase values
- Vercel Environment Variables: Preview and Production values
- `.env.example`: committed variable-name documentation

A committed `.env.production` is not required. Vercel injects production
variables during the build. Keeping production configuration in Vercel avoids
committing credentials and deployment-specific URLs.

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

Barcode scanning requires camera permission. Meal analysis can capture a new
camera photo or use the image library, then sends a compressed base64 image to
the backend.

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
- `useMealAnalysis`: camera/library selection and AI meal analysis
- `useAdvisorChat`: persisted advisor history loading and messaging

## Required Backend Routes

```text
GET    /api/v1/dashboard
POST   /api/v1/meal-logs
PATCH  /api/v1/meal-logs/{log_id}
DELETE /api/v1/meal-logs/{log_id}
GET    /api/v1/food/barcode/{barcode}
GET    /api/v1/food/search
POST   /api/v1/ai/analyze-plate
GET    /api/v1/ai/chat
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
