# Briefed

> An interactive client onboarding tool that translates vague client ideas into comprehensive, designer-ready creative briefs — in 15 minutes.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| UI | shadcn/ui + Tailwind CSS |
| Forms | React Hook Form + Zod |
| Email | Resend |
| Design | Pencil.dev |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project ([supabase.com](https://supabase.com))
- A Resend account ([resend.com](https://resend.com))

### Setup

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd Briefed
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Fill in your Supabase and Resend credentials
   ```

3. **Set up the database:**
   Run the migration in `supabase/migrations/001_initial_schema.sql` against your Supabase project via the SQL editor or CLI:
   ```bash
   npx supabase db push
   ```

4. **Generate Supabase types** (after schema changes):
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
  app/
    (auth)/           # Login, signup, auth callback
    dashboard/        # Designer portal (projects, templates, settings)
    brief/[id]/       # Client-facing questionnaire
    api/              # API routes (projects, responses, submit)
    page.tsx          # Landing page
  components/
    ui/               # shadcn/ui components (managed by CLI)
    auth/             # Auth form components
    dashboard/        # Dashboard components
    onboarding/       # Questionnaire wizard & step components
  lib/
    supabase/         # Supabase client (browser, server, admin, middleware)
    validations/      # Zod schemas
    email.ts          # Resend email utilities
    utils.ts          # General utilities
  types/
    index.ts          # App types, constants, enums
    supabase.ts       # Database types (auto-generated)
supabase/
  migrations/         # SQL migration files
  config.toml         # Supabase project config
```

## Development

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Lint
npx tsc --noEmit   # Type check
```

## Questionnaire Flow

The wizard-style questionnaire guides clients through 8 steps:

1. **Welcome** — Context and expectations
2. **About Your Business** — Company info, industry, target audience
3. **Project Scope** — Deliverables and usage contexts
4. **Style Direction** — Visual style card selection (3-5 picks)
5. **Color Preferences** — Palette selection + colors to avoid
6. **Inspiration** — Upload images + reference URLs
7. **Timeline & Budget** — Timeline, budget range, priority ranking
8. **Final Thoughts** — Open-ended notes + submit

All responses auto-save per step. Clients can close and resume via their link.

---

## Changelog

### [0.1.0] - 2026-02-13

#### Added
- Initial project scaffold with Next.js 14+, TypeScript, Tailwind CSS
- Supabase integration (Auth, Storage, PostgreSQL) with browser, server, and admin clients
- Auth middleware for protected routes
- Database schema with 7 tables: profiles, client_profiles, templates, projects, responses, assets, briefs
- Row-Level Security (RLS) policies for all tables
- Auto-created profile on signup trigger
- Updated_at triggers for all tables
- Landing page with hero, features section, and footer
- Auth pages (login, signup) with React Hook Form + Zod validation
- Auth callback route for Supabase code exchange
- Designer dashboard with project list, project detail, templates (placeholder), and settings (placeholder)
- New project creation form (client name, email, project type)
- API routes: create project, save step response (auto-save), submit brief
- 8-step wizard-style client questionnaire: Welcome, Business Info, Project Scope, Style Direction, Color Preferences, Inspiration Upload, Timeline & Budget, Final Thoughts
- Style direction cards with visual selection (8 styles, pick 3-5)
- Color palette picker with 8 preset palettes + avoid-color selector
- Inspiration step with URL references and notes (image upload placeholder)
- Timeline & budget step with priority ranking
- Brief submission with email notification to designer (via Resend)
- 18 shadcn/ui components installed (button, card, input, form, dialog, etc.)
- Pencil.dev extension installed for visual design workflow
- Zod validation schemas for all forms and questionnaire steps
- TypeScript types for project types, statuses, plan tiers, style options, brief content
- Environment variable template (.env.local.example)
- Supabase config (config.toml) for local development
