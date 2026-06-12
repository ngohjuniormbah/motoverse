# Motoverse — Setup & Deploy (Supabase, no Prisma)

Car spare-parts store. No customer accounts. Uses the Supabase JS client over
HTTPS — there is NO Postgres connection string and NO Prisma. This is what makes
it reliable on Vercel.

## What you need (only 4 required env vars)
```
ADMIN_PASSWORD=motoverse
SUPABASE_URL=https://uahvvueutymgljaqgsiq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your service_role key>
SUPABASE_BUCKET=motoverse
```
Optional email: SMTP_USER, SMTP_PASS, ADMIN_EMAIL.

Optional smart search (the search bar sources missing parts from Google and
adds them to the catalog automatically): GOOGLE_API_KEY + GOOGLE_CSE_ID
(Google Programmable Search Engine). Without these keys the search bar still
works — it falls back to a free web lookup.

## 1. Create the tables + demo data (run ONCE)
1. Supabase dashboard -> **SQL Editor** -> **New query**.
2. Open `supabase-setup.sql` from this project, copy ALL of it, paste, click **Run**.
3. Done — 12 products, 6 gallery images, 3 reviews now exist.

## 2. Storage bucket (for admin "Upload from PC")
1. Supabase -> **Storage** -> **New bucket** -> name `motoverse` -> **Public** ON.
That's it. (Without it you can still paste image URLs.)

## 3. Get your keys
- Supabase -> **Project Settings -> API**:
  - Project URL  -> SUPABASE_URL
  - service_role key (secret) -> SUPABASE_SERVICE_ROLE_KEY

## 4. Run locally (optional)
```
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```
http://localhost:3000  ·  Admin: http://localhost:3000/admin (password: motoverse)

## 5. Deploy on Vercel
1. Push to GitHub (auto-deploys).
2. Vercel -> Settings -> Environment Variables -> add the 4 vars above
   (set each for Production, Preview, Development).
3. **Redeploy** (Deployments -> latest -> ... -> Redeploy) so the vars take effect.

## Why this fixes the old database problems
The previous build used Prisma + a Postgres connection string (the
`...pooler.supabase.com:6543` URL) which kept failing with P1001 because the raw
DB port wasn't reachable. The Supabase JS client talks to the REST API over plain
HTTPS, which always works from Vercel. No connection string, no pooler, no ports.

## Admin can manage
Products (add/edit/delete, upload image from PC, make/category/price/stock/featured),
Gallery, Reviews, Orders (Call/Text/WhatsApp/Email), Messages (incl. live chat).

(c) 2026 Motoverse.
