# Commands

Always run these before committing and merging:

```
bun test                  # run all tests
npx tsc --noEmit          # type check
bun run lint              # lint (warnings are acceptable, errors are not)
```

# Git Workflow

## Branches

- `main` is the production branch. Always keep it clean.
- `develop` exists as an integration branch from `main`.
- Create a new branch per task from `main` (or `develop` if specified).
- Use descriptive branch names: `feat/round-controls`, `fix/overlay-collision`, `test/engine-coverage`, `docs/readme`, `chore/eslint-setup`.

## Commits

- Use Conventional Commits in English.
- One commit per logical change (one feature, one fix, one docs update).
- Format: `type(scope): short description`
- Types: `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `style`, `perf`
- Examples:
  - `feat(overlays): add overlay queue so pages never overlap`
  - `fix(student): avoid overlay collisions with card splashes`
  - `test(engine): expand getOutcomePoints coverage`
  - `docs: add gameplay rules guide`
  - `chore: set up eslint with bun`

## Pull Requests

- Open a PR with `gh pr create --base main` for each branch.
- PR title must match the commit message convention.
- PR body should include:
  - Summary of changes
  - Validation checklist: `bun test`, `npx tsc --noEmit`, `bun run lint`
- Merge with `gh pr merge <number> --squash --auto --delete-branch`.
- Delete the local branch after merge: `git branch -d <branch-name>`.

# Testing

- Test files live next to source files: `*.test.ts`.
- Test runner is Bun's built-in (`import { describe, test, expect } from 'bun:test'`).
- Current test files:
  - `lib/game/engine.test.ts` — game engine functions
  - `lib/game/participation.test.ts` — participation and rotation logic
  - `lib/game/phases.test.ts` — board phases and squares
  - `lib/game/cards.test.ts` — card definitions and guilds
- Always run `bun test` before committing. All tests must pass (0 failures).
- Never assume a test framework — check existing test files for conventions.

# Type Checking

- Run `npx tsc --noEmit` before every commit.
- `tsconfig.json` has `skipLibCheck: true` — do not change this.
- Test files use `@types/bun` (`"types": ["bun-types"]` in tsconfig).
- Avoid `as any` casts — use `as never` or proper type narrowing when needed for test fixtures.

# Linting

- ESLint 9 with flat config (`eslint.config.mjs`).
- Uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Disabled rules: `react-hooks/refs`, `react-hooks/set-state-in-effect`, `import/no-anonymous-default-export`.
- Warnings are acceptable (currently ~35). Errors are not — fix before committing.
- Run with `bun run lint`.

# Code Style

- No comments in code unless explicitly requested.
- Use `<Button>` from `@/components/ui/button` for all buttons.
- Follow existing patterns — look at neighboring files before adding new code.
- Import paths use `@/` alias (maps to project root).
- Never commit secrets, keys, or `.env` files.
- Keep `bun.lock` tracked in git.

# Database Migrations

- Migrations live in `supabase/migrations/`.
- Naming: `NNN_description.sql` (e.g., `013_group_card_rule_flags.sql`).
- Apply via Supabase SQL Editor or your migration workflow.
- Document new migrations in `README.md` and `supabase/README.md`.

# Architecture Notes

- Game flow: Player rolls dice → lands on luck/risk/challenge → card revealed → answer judged → advance to next player.
- Overlays use a queue system (`overlayQueue` in `StudentGame.tsx`) — one at a time, manual dismiss with `<Button>`.
- `normalizeGroup` does NOT coerce string values — `typeof` check means string numbers stay as strings.
- `chooseNextPlayerIndex` skips active player even if they have lowest participation in limited pool.
- Auto-reveal is blocked during turn intro via `turnIntroActiveRef`.
- `play_mode: 'sequential'` is hardcoded in room creation UI; parallel mode code paths remain for existing rooms but new rooms use sequential.

# PR Description Template

Use this format for PR descriptions:

```
## Summary
- Brief description of changes

## Validation
- [x] `bun test` — X pass, 0 fail
- [x] `npx tsc --noEmit` — clean
- [x] `bun run lint` — zero new errors
```

Write the body to `/tmp/pr-body.md` and use `gh pr edit <number> --body-file /tmp/pr-body.md` to avoid shell escaping issues with backticks.

# Docker

## Targets

| Stage | Description |
|-------|-------------|
| `deps` | Install dependencies (`bun install --frozen-lockfile`) |
| `dev` | Development server (`vinext dev`) — requires Cloudflare Workers runtime |
| `build` | Production build (`vinext build`) |
| `test` | Run tests (`bun test`) |
| `runner` | Production image with built app — serves via `serve-static.mjs` |

## Usage

```bash
docker compose up -d          # build + start (port 3002)
docker compose up -d --build  # force rebuild
docker compose down           # stop
docker compose logs -f        # follow logs
```

The container serves static client assets on port **3002** (map in `docker-compose.yml`). Full app rendering requires Cloudflare Workers deployment — this container is for build, test, and asset preview.

## Deploy Server (Ubuntu)

Project lives at `~/www/vitgym/` on `thy@100.120.21.97` (Tailscale).

### Update workflow

```bash
# Local: pull + build + test
git pull
bun run build
bun test

# Sync to server
rsync -avz --delete --exclude='node_modules' --exclude='.git' \
  --exclude='dist' --exclude='.vinext' --exclude='.wrangler' \
  --exclude='outputs' --exclude='work' --exclude='.next' \
  --exclude='*.log' . thy@100.120.21.97:~/www/vitgym/

# Server: rebuild + restart (container auto-restarts on failure)
ssh thy@100.120.21.97 'cd ~/www/vitgym && docker compose up -d --build'
```

The container has `restart: unless-stopped`. To stop: `docker compose down` on the server. To restart after stop: `docker compose up -d`.

## Cloudflare Workers Deploy

```bash
bun run build
node -e "
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('dist/server/wrangler.json', 'utf8'));
cfg.d1_databases[0].database_id = '<D1_DATABASE_ID>';
fs.writeFileSync('dist/server/wrangler.json', JSON.stringify(cfg, null, 2));
"
bunx wrangler deploy
```

URL: https://vitgym.fittness.workers.dev
