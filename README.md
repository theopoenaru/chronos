# Chronos

AI-powered chat application built with TanStack Start.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create PostgreSQL database:
```bash
createdb chronos
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Then edit .env.local with your actual values
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://user:password@localhost:5432/chronos`)
- `GEMINI_API_KEY` - Your Gemini API key
- `BETTER_AUTH_SECRET` - Secret key for auth (default generated for local dev)
- `BETTER_AUTH_URL` - Base URL (defaults to http://localhost:3000)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

4. Generate better-auth schema and run migrations:
```bash
npm run db:migrate     # Apply migrations to database
```

5. Start dev server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

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
npm run start
```

6. Run database migrations:
   - Set predeploy step in Render dashboard with command: `npm run db:migrate`
   - Note: Migrations should run in the runtime environment, not during build

