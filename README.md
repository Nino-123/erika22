# 🌸 A Little Garden, Just for You

A birthday website: a closed bud that blooms when she taps it, a garden of
flowers, a polaroid scrapbook, a personal letter, a wall of birthday wishes
from the people who love her, and a sunset ending.

Built with Next.js (App Router) · TypeScript · Tailwind CSS · Motion · Lucide · Supabase.

---

## 1 · Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

---

## 2 · Personalise it — everything is in ONE file

Open **`src/content/site.ts`**. Every word on the site lives there:

| What | Where in `site.ts` |
| --- | --- |
| Her name / nickname | `her.name`, `her.nickname` |
| Your name (letter signature) | `from` |
| Birthday date labels | `birthday` |
| Bud message ("Happy Birthday, My Love") | `intro.bloomMessage` |
| Headline under her name | `garden.title`, `garden.body` |
| **Your letter** | `letter.greeting`, `letter.paragraphs`, `letter.closing` |
| Album names, photos & captions | `gallery.albums` |
| Final message | `finale.message`, `finale.sign` |
| Background music | `music.src` |

Anything written in **[square brackets]** is a placeholder — search the file
for `[` to find them all before you send her the link.

### Add your photos

1. Copy photos into **`public/photos/`** (e.g. `public/photos/beach.jpg`).
2. In `site.ts`, change a photo's `src` to `"/photos/beach.jpg"`.
3. Set `aspect` to `"portrait"`, `"landscape"` or `"square"`.
4. Write a `caption` (or `""` for none) and a short `alt` description.

JPG, PNG and WEBP all work; they're resized and optimised automatically. Add
or remove photos and whole albums freely. Albums with no photos are hidden.

### Add music (optional)

Put an `.mp3` in `public/music/` and set `music.src` to e.g.
`"/music/our-song.mp3"`. A small music button appears in the corner; music
**only** starts when she taps it. Leave `src` as `""` to hide the button.

---

## 3 · Set up birthday wishes (Supabase) — ~5 minutes

Wishes are stored in a real database, so everyone sees everyone's wishes on
any device. Until this is set up, the site clearly says *"Wishes aren't
connected yet"* and the form is disabled — it never pretends to save.

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of
   **`supabase/schema.sql`**, and click **Run**.
3. Open **Project Settings → API Keys** (or **API**) and copy:
   - the **Project URL**
   - the **secret** key (`sb_secret_…`; on older projects, the `service_role` key)
4. Copy `.env.example` to **`.env.local`** and fill in:

   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SECRET_KEY=sb_secret_...
   WISHES_IP_SALT=any-long-random-string
   WISHES_REQUIRE_APPROVAL=false
   ```

5. Restart `npm run dev`. The notice disappears and wishes can be planted.

### How it's secured

- **The secret key never reaches the browser.** The browser only talks to this
  site's own `/api/wishes` route; the route (server-side) talks to Supabase.
  The env vars have no `NEXT_PUBLIC_` prefix, so Next.js never bundles them.
- **Row Level Security is on with no public policies**, so even someone who
  finds your Supabase URL can't read or write the table directly.
- **Validation** (on the server, not just the form): name ≤ 60, message 2–1000,
  memory ≤ 300 characters; invisible/control characters stripped; links
  rejected. Messages are always displayed as plain text, never as HTML.
- **Spam protection:** hidden honeypot field, "submitted too fast" check,
  same-origin check, and rate limits — 3 wishes per 10 minutes and 10 per day
  per visitor (stored only as a salted hash of their IP), plus a 2,000-wish cap.

### Moderation: instant vs. approved

- `WISHES_REQUIRE_APPROVAL=false` (default): wishes appear immediately. Best
  for a private link shared with friends and family. If something unwanted
  appears, delete its row in Supabase → **Table Editor → wishes**.
- `WISHES_REQUIRE_APPROVAL=true`: wishes are saved hidden. Approve each one by
  ticking `approved` in the Table Editor. Safer if the link may spread widely.

The rate limits slow down abuse but can't stop a determined person using many
networks — that's the trade-off of an open form. Approval mode is the fix if
that ever matters.

---

## 4 · Deploy to Vercel

1. `npm i -g vercel` (once), then `vercel login`.
2. From this folder: `vercel` (first time — accept the defaults), then
   `vercel --prod`.
3. In **Vercel → your project → Settings → Environment Variables**, add the
   same four variables from `.env.local` (for *Production*), then redeploy with
   `vercel --prod`.

After changing text or photos, run `vercel --prod` again to publish.

The site is marked `noindex`, so it won't show up in search engines. It is
still public to anyone who has the link.

---

## Project map (only if you're curious)

```
src/content/site.ts           ← ALL editable content
src/app/api/wishes/route.ts   ← secure wishes API (validation, rate limits)
src/lib/wishes.ts             ← shared validation rules
src/components/flowers/       ← SVG bloom, flower beds, falling-petal canvas
src/components/sections/      ← Intro, GardenHero, Gallery, Letter, Wishes, Finale
src/components/gallery/       ← Polaroid, Lightbox
src/components/wishes/        ← WishForm, WishCard
supabase/schema.sql           ← database table + security
```

Animations respect the "reduce motion" accessibility setting, petals pause when
the tab is hidden, and everything is keyboard accessible.
