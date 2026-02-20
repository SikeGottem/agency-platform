# [Working Title] — Master Prompt & Product Plan

> A client onboarding tool that guides non-designers through articulating their vision, then outputs a structured creative brief for designers.

---

## 0. Product Name — Brainstorm

| Name | Vibe | Domain availability? |
|------|------|---------------------|
| **Briefed** | Clean, to the point, verb-as-noun | briefed.co / getbriefed.com |
| **Moodcraft** | Creative, visual, implies mood boards | moodcraft.io |
| **ClientCanvas** | Design metaphor, client-focused | clientcanvas.com |
| **Onbrief** | "On brand" + "brief" mashup | onbrief.io |
| **Clarify** | What it literally does for clients | clarifybriefs.com |
| **BriefFlow** | Process-oriented, professional | briefflow.io |
| **Palette** | Design-adjacent, elegant | usepalette.com |
| **Inkwell** | Traditional creative writing + design | inkwell.design |
| **Scopeform** | Scope + form, very SaaS-y | scopeform.com |
| **DesignIntake** | Exactly what it is, SEO-friendly | designintake.io |
| **Framework** | Double meaning — structure + design | getframework.io |
| **Lumino** | Light/clarity metaphor, modern feel | lumino.design |
| **Decko** | Brief = pitch deck-ish, playful | decko.io |
| **Pinpoint** | Precision in capturing client vision | pinpointbrief.com |
| **Briefcase** | Obvious pun, professional | briefcase.design |

---

## 1. Product Vision

**Problem:** Designers waste hours going back-and-forth with clients trying to extract project requirements, style preferences, and creative direction. Clients say things like "make it pop" but can't articulate what they actually mean. The result: misaligned expectations, wasted revisions, and frustrated relationships.

**Solution:** An interactive, guided onboarding experience that translates vague client ideas into comprehensive, designer-ready creative briefs — in 15-20 minutes. The tool bridges the communication gap by using *visual* choices instead of open-ended verbal descriptions.

**Who it's for:**
- **Primary users:** Freelance designers and small agencies (2-10 people)

**Core Workflow:**
1. Designer sends client a custom onboarding link
2. Client completes an interactive, visually-guided questionnaire (15-20 min)
3. System generates a structured creative brief
4. Designer receives the organized brief + all client preferences & uploads (in-app + email notification)
5. *(Optional)* Client reviews/approves timeline and scope

**Project Types at Launch:**
1. **Branding** (logo, identity, brand guidelines)
2. **Web Design** (landing pages, full sites, redesigns)
3. **Social Media** (content templates, campaign assets, ad creative)

> All three share a similar workflow structure with project-type-specific sections branching off a common core.

---

## 2. Technical Architecture

### Stack (MVP)

| Layer          | Technology                    | Rationale                                        |
|----------------|-------------------------------|--------------------------------------------------|
| Framework      | **Next.js** (App Router)      | Unified frontend + API, built-in routing, SSR    |
| Language       | **TypeScript**                | Type safety as the codebase grows                |
| Backend/DB     | **Supabase** (paid plan)      | PostgreSQL + Auth + Storage + Realtime + Edge Functions — all-in-one |
| Auth           | **Supabase Auth**             | Email/password for designers, magic links for clients, optional client accounts |
| File Storage   | **Supabase Storage**          | Client-uploaded inspiration images (with buckets + RLS) |
| Email          | **Resend** or **SendGrid**    | Notifications when briefs are ready              |
| Hosting        | **Vercel**                    | Dead-simple Next.js deployment                   |
| UI Library     | **shadcn/ui**                 | Beautiful, accessible, customizable components   |
| UI Design      | **Pencil.dev**                | AI design canvas in IDE → generates React code   |
| Forms          | **React Hook Form** + **Zod** | Multi-step validation, schema-based              |

#### Design-to-Code Workflow with Pencil.dev

[Pencil.dev](https://pencil.dev) is an AI-powered design canvas that runs inside your IDE (Cursor / VS Code). It's **free during early access** and is a strong fit for this project because the questionnaire UX is the make-or-break feature.

**How it fits into the workflow:**
1. **Design screens** visually on the Pencil canvas (or imports from Figma)
2. **Pencil generates React components** from the visual design
3. **You wire up logic** — state management, Supabase integration, form validation
4. **Design files live in Git** — version-controlled, no separate Figma handoff
5. **Iterate visually** — change layout on canvas → code updates live

**Best used for:**
- Questionnaire step layouts and style preference cards
- Designer dashboard (project list, brief viewer, settings)
- Brief output / review screens
- Marketing/landing page

**Not a replacement for:** Application logic, state management, API integration, or shadcn base components — Pencil handles the *visual layer*, you handle the *brain*.

#### Why Supabase over separate services:
- **Auth** — Handles both designer (email/pwd) and client (magic link + optional accounts) auth flows natively. Row-Level Security (RLS) ensures designers only see their own projects.
- **Storage** — Built-in buckets with RLS. No need for a separate S3 setup. Supports image transformations via the CDN.
- **Realtime** — Can power live updates on the designer dashboard (brief submitted, client in progress) without adding WebSocket infrastructure.
- **Edge Functions** — Can handle async tasks like brief generation, email triggers, or image processing without a separate backend.
- **Database** — PostgreSQL with a great dashboard, SQL editor, and auto-generated TypeScript types.

### Project Structure

```
next-app/
├── /app
│   ├── /(marketing)        # Landing page, pricing, etc.
│   ├── /(auth)             # Login, signup flows (designer + client)
│   ├── /dashboard          # Designer portal
│   │   ├── /projects       # View all projects/briefs
│   │   ├── /templates      # Manage questionnaire templates
│   │   └── /settings       # Account settings
│   ├── /client             # Client portal (view their projects)
│   ├── /brief/[id]         # Client-facing onboarding flow
│   └── /api                # API routes (supplement to Supabase)
├── /components
│   ├── /ui                 # Base UI components (shadcn)
│   ├── /onboarding         # Client questionnaire components
│   ├── /dashboard          # Designer dashboard components
│   └── /brief              # Brief display/export components
├── /lib
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   ├── server.ts       # Server-side Supabase client
│   │   └── middleware.ts   # Auth middleware
│   ├── email.ts            # Email utilities
│   └── utils.ts            # General helpers
├── /supabase
│   ├── /migrations         # SQL migration files
│   ├── /functions          # Supabase Edge Functions
│   └── config.toml         # Supabase project config
└── /public
    └── /assets             # Static assets
```

### Database Schema (Supabase PostgreSQL)

```sql
-- Designers (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users primary key,
  email text not null,
  full_name text,
  avatar_url text,
  business_name text,
  plan_tier text default 'free',  -- free | pro | team
  created_at timestamptz default now()
);

-- Client accounts (also extends auth.users)
create table public.client_profiles (
  id uuid references auth.users primary key,
  email text not null,
  full_name text,
  phone text,
  company_name text,
  created_at timestamptz default now()
);

-- Questionnaire templates (designer-customizable)
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  designer_id uuid references public.profiles not null,
  name text not null,
  project_type text not null,  -- branding | web_design | social_media
  questions jsonb not null,    -- flexible question schema
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Each onboarding session
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  designer_id uuid references public.profiles not null,
  client_id uuid references public.client_profiles,
  client_email text not null,
  client_name text,
  project_type text not null,
  template_id uuid references public.templates,
  status text default 'draft',  -- draft | in_progress | completed | reviewed
  magic_link_token text unique,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Client responses (stored per-step for auto-save)
create table public.responses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects not null,
  step_key text not null,       -- e.g. 'business_info', 'style_direction'
  answers jsonb not null,       -- flexible answer data
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, step_key)  -- one response per step per project
);

-- Uploaded files (inspiration images, references, etc.)
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects not null,
  storage_path text not null,   -- path in Supabase Storage bucket
  file_name text not null,
  file_type text not null,      -- image/png, image/jpeg, etc.
  category text default 'inspiration',  -- inspiration | reference | existing_brand
  metadata jsonb,               -- dimensions, tags, etc.
  uploaded_at timestamptz default now()
);

-- Generated creative briefs
create table public.briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects not null,
  content jsonb not null,       -- structured brief data
  pdf_storage_path text,        -- path to generated PDF in Storage
  version int default 1,
  created_at timestamptz default now()
);

-- RLS policies needed for:
--   profiles: users can only read/update their own
--   projects: designers see their own, clients see projects they're invited to
--   responses: clients can write to their project, designers can read
--   assets: scoped to project access
--   briefs: designers can read, system can write
```

### Supabase Storage Buckets

```
project-assets/        -- Client-uploaded images (inspiration, references)
  /{project_id}/       -- Organized by project
    /inspiration/
    /reference/
    /existing-brand/

brief-exports/         -- Generated PDF briefs
  /{project_id}/

designer-assets/       -- Designer profile images, branding
  /{designer_id}/
```

---

## 3. Phased Roadmap

### Phase 1 — MVP (2-3 months)

**Goal:** End-to-end flow for branding, web design, and social media projects.

#### Designer Side
- [ ] Account creation (email/password via Supabase Auth)
- [ ] Generate unique onboarding links per client
- [ ] View list of completed/in-progress briefs
- [ ] Basic dashboard with project status
- [ ] Email + in-app notification when a brief is submitted

#### Client Side
- [ ] Access via magic link (Supabase Auth magic link flow)
- [ ] Optional: create a full account to view all their projects across designers
- [ ] Multi-step questionnaire with:
  - [ ] Project type selection (branding, web design, social media)
  - [ ] Visual style preference cards (pick from curated options)
  - [ ] Color picker / palette selection tool
  - [ ] Image upload for inspiration (via Supabase Storage, with client-side compression)
  - [ ] Timeline & budget range inputs
  - [ ] Open-ended text fields for nuance
- [ ] Auto-save on every answer (resume later via magic link or account login)
- [ ] Brief preview before final submission
- [ ] Progress bar showing completion percentage

#### System
- [ ] Auto-generate formatted creative brief from responses
- [ ] Email notification to designer when brief is submitted (Resend)
- [ ] Email magic link to client for resuming incomplete sessions

#### Technical Priorities
- React Hook Form for multi-step logic + validation
- Store responses as flexible JSONB (iterate on questions freely)
- Client-side image compression before upload to Supabase Storage
- Responsive design (clients may be on phone/tablet/desktop)
- Supabase RLS policies for data isolation between designers/clients

---

### Phase 2 — Enhanced (3-6 months)

**Goal:** Customization, smarter flows, and professional outputs.

- [ ] **Conditional question logic** — Project-type-specific question branches
- [ ] **Template library** — Designers can create/customize their own questionnaire templates
- [ ] **PDF export** — Generate polished creative brief PDFs (React-PDF or Puppeteer)
- [ ] **Auto-generated mood boards** — Arrange uploaded images into a visual board
- [ ] **Client portal** — Clients log in to see all their projects and track status
- [ ] **Designer branding** — Custom colors/logo on the client onboarding flow
- [ ] **Team accounts** — Multiple designers under one org
- [ ] **Revision requests** — Designer can ask client for clarification on specific answers
- [ ] **Supabase Realtime** — Live dashboard updates when clients submit

#### Technical Additions
- State management: **Zustand** for complex UI state
- PDF generation: **React-PDF** or **Puppeteer** via Supabase Edge Function
- Supabase Realtime subscriptions for live updates
- Supabase Edge Functions for async processing (PDF gen, image optimization)

---

### Phase 3 — Intelligence Layer (6-12+ months)

**Goal:** Data-driven insights and automation.

- [ ] **Style prediction** — Analyze uploaded images to suggest style keywords
- [ ] **Question optimization** — Identify which questions correlate with successful projects
- [ ] **Auto-tagging** — Automatically tag inspiration images by style, color, mood
- [ ] **Price/timeline estimation** — Suggest ranges based on historical project data
- [ ] **Smart defaults** — Pre-fill answers based on project type patterns
- [ ] **Image similarity search** — "Find similar inspiration" from a curated database

#### Technical Stack Additions
- Python microservice (**FastAPI**) for ML models
- **CLIP** or similar for image style analysis
- Supabase **pgvector** extension for image similarity (no separate vector DB needed)
- Model training pipeline (start with pre-trained, fine-tune on collected data)

> **Data note:** ML features require hundreds of completed projects minimum. Phase 1 & 2 should collect clean, structured data with ML in mind. In the meantime, rule-based logic works fine (e.g., "if modern examples chosen → suggest sans-serif fonts").

---

## 4. Key UX Principles

1. **Bridge the communication gap, not add fluff.** Every question must produce information the designer can actually act on. No "describe your brand in 3 words" filler — use visual choices that translate directly to design direction.
2. **Visual over verbal.** Use image-based choices wherever possible (style cards, color palettes, example layouts). Clients pick better when they can *see* options instead of describing them.
3. **Progressive disclosure.** Start simple, get specific. Don't overwhelm with 50 questions upfront.
4. **Save everything.** Auto-save on every answer via Supabase. Clients can close the tab and come back anytime via magic link or their account.
5. **Mobile-first.** Many clients will open the link on their phone from a text/email.
6. **Quick wins.** Show a progress bar. Let them see their brief forming as they go.

### Questionnaire Format — TBD

The format is still being determined and should be tested/iterated:
- **Option A:** Grouped sections with a few fields each (wizard-style, like Stripe onboarding)
- **Option B:** A scrollable form with clear sections (traditional but fast)
- **Recommendation:** Build Option A first (feels more premium and guided), A/B test with real clients later.

---

## 5. The Questionnaire Flow (Branding Example)

```
Step 1: Welcome & Context
  → "Hi [Client Name]! [Designer] has invited you to share your vision."
  → Brief explanation: what this is, how long it takes (~15 min), what happens next

Step 2: About Your Business
  → Company name, industry, what you do (short text)
  → Target audience — who are your customers? (multiple choice + custom)
  → Top 3 competitors or brands you admire (text + optional URL)

Step 3: Project Scope
  → What do you need? (checkbox: logo, full brand identity, brand guidelines, social templates)
  → Where will this be used? (web, print, signage, merch, social, packaging)
  → Any existing brand elements to keep? (file upload)

Step 4: Style Direction
  → Pick 3-5 style cards that resonate (visual grid with real examples)
     [Minimalist] [Bold] [Playful] [Elegant] [Vintage] [Modern] [Organic] [Geometric]
  → "Which of these brands feel like YOUR brand?" (curated examples grid)
  → "Which of these do NOT feel like you?" (anti-inspiration is just as useful)

Step 5: Color Preferences
  → Pick from pre-built palettes OR build your own (color picker)
  → "Any colors to absolutely avoid?" (checkbox grid)
  → Industry color context hint ("Most tech brands use blue — does that feel right?")

Step 6: Typography Feel (if applicable)
  → Visual A/B comparisons of font styles applied to sample text
  → "Does your brand feel more serif or sans-serif?" (side-by-side)
  → Script/handwritten? Geometric? Humanist? (visual cards, not jargon)

Step 7: Inspiration Upload
  → Drag-and-drop image upload (Supabase Storage)
  → "Share any logos, designs, photos, or screenshots that inspire you"
  → For each image: optional note — "What do you like about this?"
  → Optional: URLs to websites you admire

Step 8: Timeline & Budget
  → Ideal timeline (slider or range selector)
  → Budget range (tiered options, project-type-contextualized)
  → Priority ranking: speed vs. cost vs. quality (drag-to-rank)

Step 9: Final Thoughts
  → "Anything else your designer should know?" (open text)
  → Review summary of all answers (editable)
  → Submit
```

> **Note:** Web Design and Social Media flows follow the same structure but swap Step 3 & 6 for project-type-specific questions (e.g., "What pages do you need?" for web, "What platforms?" for social).

---

## 6. Auth & Access Model

### Designers
- **Sign up:** Email + password (Supabase Auth)
- **Login:** Email + password
- **Future:** Add Google OAuth if requested

### Clients
- **Primary access:** Magic link sent to their email (Supabase Auth magic link)
- **Permanent link:** Each project has a unique URL they can bookmark
- **Optional account:** Clients can create a full account to view all their projects across different designers
- **No friction by default:** First interaction is always link → questionnaire. Account creation is offered *after* first submission.

### Supabase RLS Model
- Designers can only read/write their own projects, templates, and briefs
- Clients can only read/write to projects they are linked to (via `client_id` or `magic_link_token`)
- Assets and responses are scoped to project access

---

## 7. Monetization Strategy

**Phase 1: Free.** Build the product, dogfood it, get real usage data. No payment integration.

**Phase 2+: Freemium model** — designer pays, clients are always free.

| Tier       | Price        | Features                                                    |
|------------|--------------|-------------------------------------------------------------|
| **Free**   | $0/mo        | 3 projects/month, basic brief template, email delivery      |
| **Pro**    | $19-29/mo    | Unlimited projects, custom templates, PDF exports, branding |
| **Team**   | $49-79/mo    | Multiple seats, shared templates, analytics, priority support|

Payment integration: **Stripe** (subscriptions + usage-based billing) — added in Phase 2.

---

## 8. Why Web Over Native App

| Factor                  | Web App ✅          | Native App ❌            |
|-------------------------|---------------------|-----------------------------|
| Client friction         | Zero (just a link)  | Requires download        |
| Development speed       | Fast iteration      | Slow (2 platforms)       |
| Cross-platform          | Built-in            | Separate iOS/Android     |
| App store approval      | None                | Weeks of review          |
| Designer adoption       | Send a link         | "Download this app"      |
| Future mobile support   | PWA or React Native | Already there             |

> **Decision:** Ship as web app. Add PWA capabilities in Phase 2. Consider React Native wrapper only if user demand is strong.

---

## 9. Risk Assessment & Mitigations

| Risk                                         | Mitigation                                                    |
|----------------------------------------------|---------------------------------------------------------------|
| Clients abandon questionnaire mid-way        | Auto-save, progress bar, keep it under 15 min, magic link resume |
| Designers find briefs too generic             | Customizable templates, conditional logic, open-ended fields  |
| Image uploads slow / large files             | Client-side compression, progress indicators, size limits     |
| Scaling ML without enough data               | Start rule-based, collect clean data from day one             |
| Competition from existing tools (Dubsado, HoneyBook) | Focus on the *creative* brief — not project management  |
| Clients don't finish                         | Test with 2-3 real clients first, iterate on flow before scaling |

---

## 10. Success Metrics (MVP)

- **Completion rate:** >70% of clients who start the questionnaire finish it
- **Time to complete:** Under 20 minutes average
- **Designer satisfaction:** Rate brief quality 4+/5 vs. current process
- **Activation:** First real client brief completed within 2 weeks of MVP launch
- **Comparison:** Brief quality vs. current email/call intake process

---

## 11. Immediate Next Steps

1. **Pick a product name** — See Section 0 above
2. **Set up Supabase project** — Create new project, enable Auth + Storage
3. **Set up the repo** — Initialize Next.js + TypeScript + Supabase + Pencil.dev
4. **Install Pencil.dev** — Add the VS Code/Cursor extension, connect to repo
5. **Design the questionnaire** — Design screens in Pencil (or Figma → import), flesh out questions for all 3 project types
6. **Build a static prototype** — Pencil-generated components + shadcn/ui, frontend-only to test UX flow
7. **Test with real clients** — Send it to 2-3 actual clients
8. **Iterate on questions** — Refine based on feedback before building full backend
9. **Build MVP** — Follow the Phase 1 checklist above

---

## 12. Open Questions

These need answers before or during development:

- [ ] **Product name** — Pick from brainstorm list or generate more
- [ ] **Questionnaire format** — Wizard (one group per screen) vs. scrollable form — needs prototyping to decide
- [ ] **Brief output format** — Formatted page in-app? PDF? Both? Need to research what designers actually want
- [ ] **Style card assets** — Where do the curated example images come from? Hand-picked? Licensed stock? Generated?
- [ ] **Questionnaire depth per project type** — How much do the 3 types diverge? Shared core + unique branches, or mostly separate?
