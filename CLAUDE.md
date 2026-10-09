# Yunto Mobile App

Android-only Expo (managed) frontend. There is no backend in this repo; the API is a separate third-party service reached over HTTP.

**Read [CONVENTIONS.md](./CONVENTIONS.md) first.** Its rules win over anything here.

## Stack (fixed, do not swap for alternatives)

- Expo SDK 57 (managed, Continuous Native Generation) + Expo Router (file-based routing in `app/`)
- TypeScript (strict, `noUncheckedIndexedAccess`)
- NativeWind v4 (Tailwind v3): `tailwind.config.js`, `global.css`, `metro.config.js`, `babel.config.js`
- TanStack Query: server state. The `QueryClientProvider` lives in `app/_layout.tsx`.
- Zustand: client state (`src/store/`)
- react-native-mmkv v4: non-sensitive cache/storage (`src/utils/storage.ts`)
- expo-secure-store: auth tokens, only through `src/utils/auth.ts`. Never use AsyncStorage or MMKV for tokens.
- Zod v4: request and response schemas on every API call, with types inferred from the schemas. No `any` (ESLint enforces this).
- expo-notifications: push (`src/utils/notifications.ts`)

## Structure

```
app/                     Expo Router screens only (thin: compose hooks/services)
src/components/common/   Generic reusable UI (only if used in 2+ places)
src/components/<page>/   Screen-specific components (create when needed)
src/services/            Typed API functions per domain; the only callers of apiRequest
src/store/               Zustand stores
src/hooks/               Shared hooks (TanStack Query hooks wrap services)
src/utils/               api.ts, auth.ts, storage.ts, notifications.ts, network.ts, constants.ts
src/types/               Shared/ambient types
```

- Import with `@/…` (maps to `src/`), configured in both `tsconfig.json` and `babel.config.js`. Don't use deep relative paths.
- `src/utils/api.ts` exports `apiRequest({ method, path, request, body, response })`. It validates the body with the `request` schema, attaches the bearer token and parses the result with the `response` schema.
- The API base URL comes from `EXPO_PUBLIC_API_BASE_URL` (see `src/utils/constants.ts`). This value is bundled into the app, so never put secrets in it.

## Package manager: bun only

Never use npm, npx, yarn or pnpm. The lockfile is `bun.lockb`.

```bash
bun install
bunx expo install <pkg>          # add deps (SDK-compatible versions); add `-- --dev` for devDeps
bun run start                    # dev server (Expo Go: scan QR)
bun run android                  # dev server + open on connected Android device
bun run lint | lint:fix
bun run format | format:check
bun run typecheck
bunx expo-doctor
```

Run `typecheck` and `lint` before calling a task done.

## Tooling notes

- There is no Android Studio or local SDK, and no committed `android/` directory. Configure native behavior through `app.json` and config plugins only.
- ESLint is pinned to v9 because `eslint-plugin-react` (pulled in by `eslint-config-expo`) crashes on ESLint 10.
- `.prettierignore` excludes `CONVENTIONS.md` and `.claude/`.
- Expo Go limits: `react-native-mmkv` is a native module that is not in Expo Go, and remote push notifications are not supported in Expo Go on Android. Both need a development build (for example `bunx eas-cli build --profile development --platform android`, which builds in the cloud and needs no local SDK). `storage.ts` creates the MMKV instance lazily, on first `getStorage()` call.
- Expo APIs change every SDK. Check the versioned docs at https://docs.expo.dev/versions/v57.0.0/ rather than relying on memory.
