# Prepwise

Prepwise is a company-focused coding interview preparation platform built with Next.js, Prisma, and PostgreSQL. It helps users practice company-specific problems, track target companies, solve coding questions in the browser, and monitor preparation progress with analytics.

This app is designed for placement preparation and includes:

- company-wise and topic-wise question discovery
- in-browser code editing with Monaco
- code execution against test cases via Judge0
- progress tracking and analytics
- admin-only problem/company management
- custom email/password authentication with secure httpOnly cookies

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- Tailwind CSS
- Judge0 for code execution

## Project Purpose

The product is centered around target-company preparation. Users can:

- select target companies
- view relevant problems by company and topic
- solve questions directly in the browser
- review submission history and performance
- track difficulty and company readiness over time

Admins can create and manage problems and companies from the admin flow.

## Repository Structure

```text
app/                  # App router pages and API routes
components/           # Reusable UI and feature components
lib/                  # Auth, Prisma, utilities, and integrations
prisma/               # Prisma schema and DB seed scripts
public/               # Static assets
middleware.ts         # Route middleware
package.json          # Scripts and dependencies
```

## Local Development

1. Install dependencies

```bash
npm install
```

2. Create your environment file

```bash
cp .env.example .env.local
```

If you do not have a `.env.example`, create `.env.local` manually with the values below.

3. Configure environment variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# PostgreSQL (Supabase Postgres)
DATABASE_URL="postgresql://postgres:password@host:5432/postgres"
DIRECT_URL="postgresql://postgres:password@host:5432/postgres"

# Admin access control
ADMIN_EMAILS=you@example.com,admin@example.com
NEXT_PUBLIC_ADMIN_EMAILS=you@example.com,admin@example.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Judge0
JUDGE0_API_URL=https://ce.judge0.com
JUDGE0_API_KEY=
JUDGE0_USE_RAPIDAPI=false
JUDGE0_MOCK=false
```

Important notes:

- This project does not use Supabase Auth for login.
- Authentication is custom and database-backed using Prisma + hashed passwords + httpOnly cookies.
- `ADMIN_EMAILS` controls who can access admin routes.

4. Sync the Prisma schema to your database

```bash
npx prisma db push
```

5. Seed company/topic metadata

```bash
npm run db:seed
```

6. Start the app

```bash
npm run dev
```

Open http://localhost:3000

## Database Setup

This app expects a PostgreSQL database. The recommended setup is Supabase Postgres.

Use the connection URL from Supabase project settings:

- `DATABASE_URL` should be the pooled connection string if using pooler
- `DIRECT_URL` should be the direct connection string for Prisma operations and migrations

Example:

```env
DATABASE_URL="postgresql://postgres.<project_ref>:<password>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<project_ref>:<password>@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

If you are using Prisma with Supabase, always keep both values configured correctly. Do not point the app to SQLite.

## Authentication

Authentication is implemented with a custom flow instead of Supabase Auth.

Behavior:

- users sign up with email and password
- passwords are hashed before saving
- sessions are stored in the database and issued as httpOnly cookies
- `/admin` access is restricted by email allowlist via `ADMIN_EMAILS`

The schema for this flow lives in `prisma/schema.prisma` and the session logic lives in `lib/auth/custom.ts`.

## Admin Access

Admin routes are protected by email allowlisting.

```env
ADMIN_EMAILS=admin@example.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

Only these addresses are treated as admins. It is recommended to keep this list minimal and private.

## Seed Data

The app does not ship a database filled with active coding problems by default. Seed data is used only for foundational metadata such as companies and topics:

- `prisma/seed.ts`
- `prisma/seed-data.ts`

This means the application is ready for a real data setup, but problem content should be managed from the admin UI or inserted directly in the database.

## Judge0 Integration

The app supports code execution through Judge0.

Environment variables:

```env
JUDGE0_API_URL=https://ce.judge0.com
JUDGE0_API_KEY=
JUDGE0_USE_RAPIDAPI=false
JUDGE0_MOCK=false
```

For production, use a stable Judge0 deployment or a reliable hosted service. The public CE endpoint may be enough for demos, but self-hosting or a managed service is recommended for production reliability.

## Deployment on Vercel

1. Push the repo to GitHub.
2. Import the project into Vercel.
3. Add the required environment variables in the Vercel dashboard.
4. Set the production domain in `NEXT_PUBLIC_APP_URL`.
5. Ensure the database is reachable from Vercel and `DATABASE_URL` is valid.
6. Build and deploy.

Recommended production env values:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_EMAILS=you@example.com
NEXT_PUBLIC_ADMIN_EMAILS=you@example.com
JUDGE0_API_URL=https://ce.judge0.com
JUDGE0_API_KEY=
JUDGE0_USE_RAPIDAPI=false
JUDGE0_MOCK=false
```

## Useful Commands

```bash
npm install
npm run dev
npm run build
npx prisma generate
npx prisma db push
npm run db:seed
```

## Notes

- The project is intentionally not built around Supabase Auth.
- Admin access is controlled by explicit emails, not role tables.
- The app is ready for production Vercel deployment when the correct Postgres and admin env vars are supplied.

## License

This project is for internal/portfolio usage unless a separate license is provided.

