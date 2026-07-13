# Linkly — Premium URL Shortener

A production-ready SaaS URL shortener built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, and Supabase.

## Features

- **Landing Page** — Premium marketing site with hero, features, pricing, FAQ, and CTA
- **Authentication** — Email, Google, and GitHub login via Supabase Auth
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
- Supabase (Auth + PostgreSQL)
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
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
3. Enable Google and GitHub auth providers in Authentication → Providers
4. Add redirect URL: `http://localhost:3000/auth/callback`

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

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Update Supabase redirect URLs to your production domain

## License

MIT
