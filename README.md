# JobMatch

Find the jobs that fit you. Upload your resume, discover relevant jobs matched to your skills, and apply on the original job site.

## Installation & Development Setup

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your PostgreSQL `DATABASE_URL` and a random `NEXTAUTH_SECRET`.

3. **Database Setup & Migration**
   Ensure your PostgreSQL database is running, then execute:
   ```bash
   npx prisma db push
   # OR for production migrations:
   # npx prisma migrate dev
   ```

4. **Development**
   Start the development server with the mock job source enabled:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Production Build & Start

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start in Production Mode**
   ```bash
   npm run start
   ```
   Ensure `ENABLE_MOCK_SOURCE="false"` in your production environment if you don't want mock data.

## Job Source Configuration

The application uses a modular job source architecture located in `src/lib/job-sources/`. 
To add a new source:
1. Create a new file in `src/lib/job-sources/` implementing the `JobSource` interface.
2. Add your new source to the `sources` array in `src/lib/job-sources/aggregator.ts`.

## Extending Skills Dictionary

To improve parsing and matching, you can extend the skills dictionary located in `src/lib/skills/dictionary.ts`. Simply add new skill aliases to `SKILL_ALIASES` or modify `ROLE_RULES`.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL & Prisma ORM
- **Auth:** NextAuth.js
- **UI:** Tailwind CSS & shadcn/ui
- **PDF Parser:** pdf-parse
