# Caliper App

Caliper is a calorie, macro, meal, weight, and AI nutrition tracking app. This
repository contains the user-facing app: the screens people open on web, iOS, or
Android.

[Open the live app](https://caliperam.vercel.app/)

[Download Android APKs](https://github.com/AndreiMunteanu2911/Caliper-Calorie-Tracker-Frontend/releases)

## What You Can Do With Caliper

Caliper is built around everyday nutrition tracking:

- See today's calorie and macro progress at a glance.
- Log meals under breakfast, lunch, dinner, or snacks.
- Search for foods by name.
- Scan packaged-food barcodes.
- Take or upload a meal photo and ask AI to estimate the food and macros.
- Chat with an AI nutrition advisor that can use today's food log and recent
  nutrition history.
- Keep multiple advisor conversations and return to older chats.
- Track weight over time.
- Calculate calorie and macro targets with a TDEE calculator.
- Use the same app on web, Android, and iOS.

## How The App Feels To Use

The app is organized around a few main areas:

- **Dashboard**: today's calorie and macro status, plus recent meal activity.
- **Diary**: a day-by-day view of logged foods.
- **Scan**: barcode scanning, food search, custom foods, and AI meal analysis.
- **AI Advisor**: a chat-style nutrition assistant with conversation history.
- **Profile**: personal targets, TDEE calculation, and account controls.
- **Weight**: weight entries and visual progress history.

You do not need to understand the technical setup to use the app. Sign in, set
your goals, log food, and Caliper keeps the daily totals current.

## Design Credit

The visual direction is inspired by
[Nutri AI Food Calorie Tracker App](https://www.figma.com/community/file/1500608399091759099/nutri-ai-food-calorie-tracker-app).

## For People Setting It Up

The app needs a backend service and a Supabase project. Supabase handles user
accounts. The backend handles food lookup, meal logging, AI features, and saved
history.

### Requirements

- Node.js compatible with Expo SDK 56
- npm
- A running Caliper backend
- A Supabase project configured with the backend database migrations
- Android Studio for Capacitor Android builds

### Environment File

Create a local environment file:

```powershell
Copy-Item .env.example .env.local
```

Fill it in:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

`EXPO_PUBLIC_SUPABASE_ANON_KEY` is safe to use in the app. It is Supabase's
public anonymous key, not an admin key. Never put a Supabase service-role key in
the frontend.

### API URL On Phones And Emulators

`localhost` means "this device", so the API URL depends on where the app runs:

- Android emulator: `http://10.0.2.2:8000/api/v1`
- iOS simulator: `http://localhost:8000/api/v1`
- Physical phone: `http://<your-computer-lan-ip>:8000/api/v1`

If you run the web app locally, the backend CORS settings must allow the local
web address printed by Expo.

## Run The App Locally

Install dependencies:

```powershell
npm install
```

Start the backend first from `Caliper-Backend`, then start Expo here:

```powershell
npm start
```

Development shortcuts:

```powershell
npm run web
```

For Expo Web, open the local URL printed in the terminal, usually
`http://localhost:8081`.

## Quick Manual Check

After setup, a useful manual walkthrough is:

1. Open the welcome page.
2. Create an account or sign in.
3. Confirm the dashboard loads.
4. Search for a food and log it.
5. Edit the logged amount or meal type.
6. Scan a barcode if camera permissions are available.
7. Try meal photo analysis.
8. Send a message in AI Advisor and open conversation history.
9. Add a weight entry.
10. Sign out and confirm protected pages are no longer accessible.

## Deploying The Web App

The frontend and backend are separate Vercel projects. Deploy the backend first,
because the frontend needs the backend URL during its build.

### Vercel Project Settings

Use:

- Root Directory: repository root
- Framework Preset: Other
- Install Command: `npm install`
- Build Command: `npm run build:web`
- Output Directory: `dist`

`vercel.json` already contains the build/output settings.

### Production Environment Variables

Set these in Vercel:

```env
EXPO_PUBLIC_API_URL=https://your-backend.vercel.app/api/v1
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Values beginning with `EXPO_PUBLIC_` are bundled into the app. Do not put
secrets there.

After changing one of these values, redeploy the frontend.

## Build An Android App With Capacitor

Capacitor packages the exported web app from `dist` into an Android WebView.
Expo is still used to build the web bundle.

Install dependencies:

```powershell
npm install
```

The Capacitor config is committed in `capacitor.config.ts`. Create the native
Android project once if the `android/` directory has not been created. Build
the web app first because Capacitor expects `dist/index.html` when Android is
added:

```powershell
npm run build:web
npx cap add android
```

After Android exists, build the web app and sync it into Android:

```powershell
npm run cap:build
```

Open the Android project:

```powershell
npm run cap:open
```

Build or run the app from Android Studio. For command-line runs:

```powershell
npm run cap:run
```

Use a deployed backend URL for packaged Android builds, for example:

```env
EXPO_PUBLIC_API_URL=https://your-backend.vercel.app/api/v1
```

Do not use `localhost` for packaged phone builds.

### Supabase Redirect URLs

In Supabase **Authentication > URL Configuration**, allow local and production
redirects:

```text
http://localhost:8081/**
https://your-frontend.vercel.app/**
```

## How It Works

The frontend signs users in with Supabase. Supabase returns an access token, and
the app sends that token to the backend with each protected request:

```http
Authorization: Bearer <supabase-access-token>
```

The backend checks the token before reading or changing any user data.

## Main Technologies

- Expo SDK 56
- Expo Router
- React Native 0.85
- React 19
- TypeScript
- NativeWind and Tailwind CSS
- Supabase Auth
- Expo Camera
- Expo Image Picker

## Project Map

```text
app/
  index.tsx                         Welcome page
  sign-in.tsx                       Sign-in page
  sign-up.tsx                       Account creation page
  (protected)/
    (tabs)/
      dashboard.tsx                 Dashboard tab
      scan.tsx                      Food search, barcode scan, meal analysis
      chat.tsx                      AI Advisor tab

src/
  components/                       Reusable screen and UI components
  hooks/                            App state, API calls, and mutations
  lib/
    api-client.ts                   Backend client with auth token handling
    supabase.ts                     Supabase client
  types/
    api.ts                          Shared API data shapes
```

Route files stay small. Most fetching, form state, and interaction logic lives
in custom hooks.

## Important App Flows

### Food Logging

1. Search, scan, or select a food.
2. Choose a meal type and amount in grams.
3. The backend calculates nutrients for that amount.
4. The dashboard refreshes with updated daily totals.

### Meal Photo Analysis

The app asks for camera or library permission, sends a compressed image to the
backend, and receives estimated foods, calories, and macros.

### AI Advisor

The advisor can use today's food log, remaining macros, and recent nutrition
history. Conversations are saved so users can return to older chats.

### Weight Tracking

Users can add dated weight entries and view their progress history.

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
GET    /api/v1/ai/conversations
GET    /api/v1/weight-logs
POST   /api/v1/weight-logs
DELETE /api/v1/weight-logs/{log_id}
POST   /api/v1/profile/tdee
```

## Troubleshooting

### The app says configuration is missing

Check `.env.local`, then restart Expo. Expo reads public environment values when
the app starts.

### The camera does not open

Grant camera permission. Capacitor Android camera behavior may need a dedicated
Capacitor Camera integration if browser camera APIs are not enough.

### A phone cannot reach the backend

Use your computer's LAN IP address instead of `localhost`, keep both devices on
the same network, and allow the backend port through your firewall.

### The dashboard is empty

Confirm the user is signed in, the backend is running, and the Supabase database
migrations were applied to the same project configured in `.env.local`.
