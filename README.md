# Payload 4 reproductions

Minimal reproductions for [Payload](https://github.com/payloadcms/payload) 4 issues.

`main` is a clean baseline. Every reproduction lives on its own branch cut from `main`
(`repro-<short-description>`), so an issue can link straight to its branch.

## Layout

| Path | What |
| --- | --- |
| `apps/next/payload.config.ts` | The one Payload config both apps serve. Add collections, globals and plugins here |
| `apps/next/collections/` | Collections of the baseline (`users`, `media`, `posts`) |
| `apps/next/helpers/seed.ts` | Seed data, runs in `onInit` (creates the auto-login user) |
| `apps/next/` | Next.js dev app, http://localhost:3000/admin |
| `apps/tanstack/` | TanStack Start dev app, http://localhost:3001/admin. Imports the config above and keeps its own import map |

Versions are pinned in one place, the `catalog:` in `pnpm-workspace.yaml`.

## Running

Requires Node 24.22.1+ and pnpm 10.

```bash
pnpm install

pnpm dev                    # Next.js, MongoDB in memory
pnpm dev:tanstack           # TanStack Start, MongoDB in memory
pnpm dev:sqlite             # Next.js, SQLite (apps/next/.sqlite/payload.db)
pnpm dev:tanstack:sqlite    # TanStack Start, SQLite (same file)
```

The admin opens signed in as `dev@payloadcms.com` / `password` (`autoLogin`).

- **MongoDB** is the default: a throwaway `mongodb-memory-server` replica set, so every restart
  starts empty and re-seeds. Set `DATABASE_URI_MONGO` to use a real instance. Running both apps at
  once gives each its own in-memory database.
- **SQLite** keeps its data between restarts. `pnpm reset:sqlite` deletes the file.

## Generation

Types and import maps regenerate on boot. To run it by hand (or after `PAYLOAD_SKIP_AUTOGEN=1`):

```bash
pnpm generate               # types + both import maps
pnpm generate:types
pnpm generate:importmap     # Next.js and TanStack Start import maps
```

## Orphaned MongoDB temp directories

`mongodb-memory-server` removes its data directory only on a clean stop. On Windows `next dev`
kills the server before that runs, so every restart leaves a `mongo-mem-*` directory in the OS
temp folder. The dev config caps the WiredTiger journal (`log=(file_max=10MB,prealloc=false)`),
which keeps each orphan around 11 MB instead of 300 MB. To sweep them:

```bash
pnpm check:mongo-temp       # dry run
pnpm clean:mongo-temp       # delete orphans older than 60 minutes (--min-age=<minutes>)
```

## Adding a reproduction

```bash
git switch main && git switch -c repro-<short-description>
# edit apps/next/payload.config.ts, collections, seed
git commit -am "repro: <what is broken>"
git push -u origin repro-<short-description>
```
