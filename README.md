# Linkly — Premium URL Shortener

A production-ready SaaS URL shortener built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, and Supabase.

## Features

- **Landing Page** — Premium marketing site with hero, features, pricing, FAQ, and CTA
- **Authentication** — Email, username, and password via Supabase Auth
- **Dashboard** — Overview with stats, recent links, and quick actions
- **Link Management** — Create, edit, delete, copy, QR codes, custom slugs, expiration, password protection
- **Analytics** — Clicks, visitors, countries, devices, browsers, referrers with interactive charts
- **Settings** — Profile, password, billing, account deletion
- **Security** — Row Level Security, rate limiting, input validation, secure redirects

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Framer Motion
- Supabase (PostgreSQL database + authentication)
- React Hook Form + Zod
- TanStack React Query
- Recharts
- Lucide Icons

## Getting Started

### 1. Clone and install

```bash
cd link-shortner
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in order via the SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/003_supabase_auth.sql` (skip `002_clerk_profiles.sql` on fresh installs)
3. In Authentication → Providers, enable **Email** (email + password)
4. Optional: disable email confirmation in Authentication → Providers → Email for faster local dev

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Linkly
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register, forgot password
│   ├── [slug]/          # Short link redirect handler
│   ├── api/             # REST API routes
│   ├── auth/callback/   # OAuth callback
│   ├── dashboard/       # Protected dashboard pages
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/
│   ├── analytics/       # Analytics charts
│   ├── auth/            # Auth forms
│   ├── dashboard/       # Sidebar, header
│   ├── landing/         # Landing page sections
│   ├── links/           # Link management
│   ├── settings/        # Settings forms
│   ├── shared/          # Reusable components
│   └── ui/              # shadcn/ui components
├── hooks/               # React Query hooks
├── lib/                 # Utilities, validations, Supabase
└── types/               # TypeScript types
supabase/
└── migrations/          # Database schema + RLS
```

## Database

The schema includes:

- `profiles` — User profiles (auto-created on signup)
- `links` — Short links with slugs, passwords, expiration
- `click_events` — Analytics tracking
- `api_keys` — API key management

All tables have Row Level Security enabled.

## Deployment (Vercel)

### 1. Push to GitHub

Commit your code and push to a GitHub repository.

### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Set **Root Directory** to `link-shortner` if the repo root is the parent folder, otherwise leave as `.`
4. Framework preset: **Next.js** (auto-detected)

### 3. Environment variables

Add these in Vercel → Project → Settings → Environment Variables:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` (or custom domain) |
| `NEXT_PUBLIC_APP_NAME` | `Linkly` |

### 4. Supabase production settings

In Supabase → Authentication → URL Configuration:

- **Site URL:** `https://your-domain.vercel.app`
- **Redirect URLs:** add `https://your-domain.vercel.app/**`

Run `supabase/migrations/003_supabase_auth.sql` in the SQL Editor if you have not already.

### 5. Deploy

Click **Deploy**. Vercel builds with `npm run build` and hosts the app automatically on every push to your main branch.

## License

MIT
