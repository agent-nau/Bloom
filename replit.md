# Bloom - Menstrual Cycle Tracker

## Project Overview

Bloom is a privacy-first menstrual cycle tracking app built with Expo (React Native) and an Express TypeScript backend. All user data is stored locally on the device using AsyncStorage — no accounts, no cloud sync.

## Architecture

This is a pnpm monorepo with the following packages:

### Artifacts (apps)
- `artifacts/mobile` — Expo React Native app (frontend, port 8081 in dev, 5000 in production)
- `artifacts/api-server` — Express + TypeScript REST API server (port 3000)
- `artifacts/mockup-sandbox` — Vite-based UI component sandbox

### Libs (shared packages)
- `lib/db` — Drizzle ORM + PostgreSQL database layer
- `lib/api-spec` — OpenAPI specification
- `lib/api-zod` — Zod schemas for API validation
- `lib/api-client-react` — React Query API client hooks

### Scripts
- `scripts/` — Utility scripts

## Development Workflows

- **Start application** — Expo dev server on port 5000 (`PORT=5000 pnpm --filter @workspace/mobile dev`)
- **Start Backend** — Express API server on port 3000 (`PORT=3000 pnpm --filter @workspace/api-server dev`)

## Technology Stack

- **Frontend**: Expo SDK 54, React Native, Expo Router (file-based routing), React Query
- **Backend**: Express 5, TypeScript, Pino logging
- **Database**: PostgreSQL with Drizzle ORM (currently empty schema — app uses AsyncStorage for local data)
- **Styling**: React Native StyleSheet, custom color system via `constants/colors.ts` + `hooks/useColors.ts`
- **Package Manager**: pnpm (workspace)
- **Build**: esbuild (backend), Expo CLI (mobile)

## Key Features

- Home screen: current cycle day & phase with visual progress bar
- Calendar view: color-coded cycle visualization
- Quick logging: period, flow intensity, mood, and 12 symptoms
- Insights: cycle history, averages, trends
- Profile: settings and data management

## Privacy

All data stored locally via AsyncStorage — no server-side persistence for cycle data. The backend currently only serves a health check endpoint.

## File Structure Notes

- Mobile app routes: `artifacts/mobile/app/` (Expo Router file-based)
- Tabs: `artifacts/mobile/app/(tabs)/` — index (home), calendar, log, insights, profile
- Context: `artifacts/mobile/context/` — CycleContext, ThemeContext, UserContext
- Components: `artifacts/mobile/components/`
- Constants/Hooks: `artifacts/mobile/constants/colors.ts`, `artifacts/mobile/hooks/useColors.ts`

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (set if/when DB is needed)
- `PORT` — Server port (injected by workflow)
- `REPLIT_DEV_DOMAIN`, `REPL_ID` — Replit-specific (used by Expo for QR code)
