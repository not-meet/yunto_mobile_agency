# Project Conventions

## Structure
- `app/` — Expo Router screens only, kept thin (compose + hooks/services calls, no business logic)
- `src/components/common/` — generic reusable UI (Button, Input, Card...)
- `src/components/<page>/` — screen-specific components, named after the route
- `src/services/` — typed API call functions, grouped by domain (authService, userService)
- `src/utils/` — cross-cutting singletons (api client, storage, auth, notifications, network, permissions)
- `src/store/` — zustand stores
- `src/hooks/` — shared hooks

## Rules
- No raw `api.post()` calls outside `services/` — always go through a service function
- Every service function must define Zod schemas for both request and response, and export inferred types — no `any`, no raw untyped `axios` responses passed to components
- Auth tokens only via `utils/auth.ts` (SecureStore-backed), never AsyncStorage
- Styling: NativeWind only, no StyleSheet.create unless NativeWind can't express it
- Path aliases via `@/` — no `../../../`
- New common component → must be used in 2+ places, else it stays in the page folder

## Stack
Expo (managed) + Expo Router + NativeWind + TanStack Query + Zustand + MMKV
