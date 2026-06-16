# Tumpline — Eleventy

Static landing page for Tumpline, built with [Eleventy (11ty)](https://www.11ty.dev/) and [Tailwind CSS v4](https://tailwindcss.com/).

## Stack

- **Eleventy** — static site generation, Nunjucks templates
- **Tailwind CSS v4** — compiled via `@tailwindcss/cli`, custom `@theme` in `src/assets/css/site.css`
- **Vanilla JS** — contact form (`src/assets/js/form.js`)
- **Supabase** — lead capture for the contact form
- **Calendly** — booking redirect after a lead is captured
- **Cloudflare Pages** — hosting and deployment

## Develop

```bash
npm install
npm run dev      # Eleventy dev server + Tailwind watcher → http://localhost:8080
```

`npm run build` produces the production site in `_site/`.

## Project layout

```
src/
  _data/        site.js — all content and config (copy, services, nav, Supabase/Calendly credentials)
  _includes/    base layout and one partial per page section
  assets/
    css/        site.css, fonts.css, theme.css
    fonts/      self-hosted woff2 files
    img/        hero image and other assets
    js/         form.js
  index.njk     assembles all section partials
supabase/
  schema.sql    tumpline_leads table + RLS insert policy
```

Content lives in `src/_data/site.js` — edit copy there without touching templates.

## Contact form: Supabase + Calendly setup

Until configured, the form still shows a success confirmation (no lead is lost silently). To enable live lead capture:

1. **Create a Supabase project** at <https://supabase.com> (free tier is fine).
2. **Create the leads table:** open *SQL Editor → New query*, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the `tumpline_leads`
   table and a row-level-security policy that allows anonymous inserts only.
3. **Copy your credentials:** *Project Settings → API* → copy the **Project URL** and the
   **anon / public** key.
4. **Fill in `src/_data/site.js`:**
   ```js
   supabaseUrl: "https://YOUR-PROJECT.supabase.co",
   supabaseAnonKey: "YOUR-ANON-KEY",
   calendlyUrl: "https://calendly.com/your-name/30min",
   ```
   The anon key is safe to ship in client-side code — RLS keeps the table write-only.
5. **Rebuild** (`npm run dev` or `npm run build`). On submit the form now inserts the
   lead and opens Calendly in a new tab. Verify rows land in *Table Editor → tumpline_leads*.

If the insert fails the form falls back to the inline success message so a lead is never lost.
