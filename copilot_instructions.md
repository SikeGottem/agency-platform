# Briefed — Copilot Instructions

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions) |
| UI | shadcn/ui + Tailwind CSS |
| Forms | React Hook Form + Zod |
| Payments | Stripe Connect |
| Hosting | Vercel |

---

## ⚠️ CRITICAL: ALWAYS UPDATE THE CHANGELOG ⚠️

EVERY time you make changes, you MUST update the Changelog in `README.md` BEFORE committing.

- Add a new version section if this is a new feature/release
- Format: `### [X.X.X] - YYYY-MM-DD`
- Categorize under: **Added**, **Changed**, **Fixed**, **Removed**
- Write clear, user-friendly descriptions

---

## Versioning & Commits

### Semantic Versioning

- **MAJOR** (`X.0.0`): Breaking changes
- **MINOR** (`0.X.0`): New features, backwards compatible
- **PATCH** (`0.0.X`): Bug fixes, small improvements

### Commit Message Format

```
type(scope): description
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Rules

- **DO NOT COMMIT automatically** — Wait for user confirmation that the feature works
- **DO NOT PUSH automatically** — Only commit. User will push when ready.

---

## Before Committing Checklist

```bash
# 1. Type check (catches TypeScript errors)
npx tsc --noEmit

# 2. Next.js lint (catches framework-specific issues like missing Image imports, bad <a> tags)
npx next lint

# 3. Full build (catches SSR/RSC boundary issues — run before deploy or if unsure)
npx next build
```

- [ ] TypeScript passes (`npx tsc --noEmit`)
- [ ] Next.js lint passes (`npx next lint`)
- [ ] Changelog updated in `README.md`
- [ ] Semantic commit message used
- [ ] Version bump considered

---

## Next.js App Router Conventions

### File Structure

```
src/
  app/                    # App Router pages & layouts
    (auth)/               # Route groups for auth pages
    (dashboard)/          # Route groups for dashboard
    api/                  # API routes (Route Handlers)
    layout.tsx            # Root layout
    page.tsx              # Home page
  components/
    ui/                   # shadcn/ui components (DO NOT edit directly)
    [feature]/            # Feature-specific components
  lib/
    supabase/             # Supabase client, server client, middleware helpers
    stripe/               # Stripe helpers
    utils.ts              # General utilities
    validations/          # Zod schemas
  hooks/                  # Custom React hooks
  types/                  # TypeScript types & interfaces
```

### Server vs Client Components

- **Default is Server Component** — don't add `'use client'` unless needed
- **Use `'use client'` only when:** using hooks (`useState`, `useEffect`, `useRouter`), browser APIs, event handlers, or React context
- **Never import server-only code in client components** (e.g., direct Supabase admin client, env vars without `NEXT_PUBLIC_`)
- **Pass data down** — fetch in server components, pass as props to client components

### Route Handlers (API Routes)

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // ...
  return NextResponse.json({ data })
}
```

### Environment Variables

- `NEXT_PUBLIC_*` — exposed to the browser (Supabase anon key, Stripe publishable key)
- Everything else — server-only (Supabase service role key, Stripe secret key)
- Never hardcode secrets — always use `process.env`

---

## Supabase Conventions

### Client Setup

- **Browser client:** `createBrowserClient()` — for client components
- **Server client:** `createServerClient()` — for server components, Route Handlers, Server Actions
- **Admin client:** `createClient()` with service role key — for Edge Functions and admin operations only

### Database Migrations

- Migrations go in `supabase/migrations/`
- Use unique sequential numeric prefixes: `001_`, `002_`, etc. (check existing files for next number)
- **NEVER reuse a prefix number**
- Format: `XXX_descriptive_name.sql` (e.g., `003_add_payment_schedules.sql`)
- Always use idempotent SQL:
  - `CREATE TABLE IF NOT EXISTS`
  - `DROP POLICY IF EXISTS` before `CREATE POLICY`
  - `CREATE OR REPLACE FUNCTION`
- After creating a migration: `npx supabase db push`
- Generate types after schema changes: `npx supabase gen types typescript --local > src/types/supabase.ts`

### Row-Level Security (RLS)

- **Every table MUST have RLS enabled**
- Designers see only their own data
- Clients see only projects they're linked to (via `client_id` or `magic_link_token`)
- Always test RLS policies with both designer and client roles

### Realtime

- Use Supabase Realtime for: live workshop mode, comment threads, stage transitions, notifications
- Subscribe at the component level, unsubscribe on unmount
- Use channels for scoped subscriptions (e.g., `project:{projectId}`)

---

## Stripe Connect Conventions

- Use **Stripe Connect** (platform takes application fee on each payment)
- Payment intents go through the platform account
- Designer's Stripe account = Connected Account
- Always use `application_fee_amount` on payment intents
- Handle webhooks in `/api/webhooks/stripe/route.ts`
- Verify webhook signatures with `stripe.webhooks.constructEvent()`
- Use idempotency keys for payment operations

---

## UI & Styling

### shadcn/ui

- Install components via `npx shadcn-ui@latest add [component]`
- Don't manually edit files in `components/ui/` — they're managed by shadcn CLI
- Extend via wrapper components in `components/[feature]/`

### Tailwind CSS

- Use Tailwind utility classes for styling
- Custom design tokens go in `tailwind.config.ts`
- Follow mobile-first responsive design (`sm:`, `md:`, `lg:`)
- Client-facing views are mobile-first

### Forms

- Always use React Hook Form + Zod for form validation
- Zod schemas live in `lib/validations/`
- Share Zod schemas between client validation and API route validation

---

## TypeScript Rules

- **Strict mode** — no `any` types unless absolutely necessary
- Use Supabase-generated types for all database interactions
- Define API response types explicitly
- Use discriminated unions for state management (loading | error | success)
- Prefer `interface` for object shapes, `type` for unions/intersections

---

## Error Handling

- Use Next.js `error.tsx` boundaries for page-level errors
- Use `loading.tsx` for page-level loading states
- API routes return proper HTTP status codes with typed error responses
- Supabase operations: always check `.error` before using `.data`
- Stripe operations: always wrap in try/catch, log errors server-side

---

## Current Version

Check the Changelog section in `README.md` for the current version.
