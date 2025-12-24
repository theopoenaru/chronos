# Chronos

AI-powered chat application built with TanStack Start.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Then edit .env.local with your actual values
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Your Gemini API key (optional for local dev)
- `BETTER_AUTH_SECRET` - Secret key for auth (optional for local dev)
- `BETTER_AUTH_URL` - Base URL (defaults to http://localhost:3000)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (optional)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (optional)

3. Generate and run migrations:
```bash
npm run auth:generate  # Generate better-auth schema files
npm run db:generate     # Generate Drizzle migrations (includes better-auth tables)
npm run db:migrate      # Apply migrations to database
```

Note: For Drizzle, `auth:generate` creates the schema files that need to be imported into your main schema. Then use Drizzle's migration tools to apply them.

4. Start dev server:
```bash
npm run dev
```

## Production (Render)

1. Set environment variables in Render dashboard:
   - `DATABASE_URL` (use internal URL)
   - `GEMINI_API_KEY`
   - `BETTER_AUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `BETTER_AUTH_URL` (your Render service URL)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NODE_ENV=production`

2. Configure Google OAuth:
   - Add redirect URI: `https://your-app.onrender.com/api/auth/callback/google`

3. Set pre-deploy command:
```bash
npm run render:deploy
```

4. Build command:
```bash
npm run build
```

5. Start command:
```bash
npm run preview
```

6. Run database migrations:
   - Option A: Create a one-off "migrate" job in Render dashboard with command: `npm run db:migrate`
   - Option B: Run migrations manually via Render shell: `npm run db:migrate`
   - Note: Migrations should run in the runtime environment, not during build

