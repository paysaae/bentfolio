# bentfolio

**A playful, open-source bento portfolio builder.** bentfolio brings projects, social links, playlists, and personal details together in a colorful, responsive grid.

## Features

- Build a personal portfolio from flexible bento blocks.
- Share a public profile at `/<username>`.
- Add, edit, remove, and reorder blocks from a private dashboard.
- Create project, social link, Spotify, GitHub, photo, and note blocks.
- Publish or unpublish a portfolio.
- Enjoy a responsive interface with playful motion and recognizable brand icons.
- Choose from 20 language options, with English as the default.

## Tech stack

- Next.js App Router and React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React, Simple Icons, and Font Awesome brand icons
- Supabase Auth and Postgres

## Project overview

- `app/` — landing page, authentication routes, dashboard route, and public portfolio route
- `components/` — landing, auth, dashboard, branding, and language UI
- `lib/` — Supabase clients and localization data
- `supabase/migrations/` — profile block data and signup trigger migration

## Localization

English is the default locale. The interface includes a language selector with 20 Latin-script language options. Locale labels and prominent headings are maintained in `lib/i18n.ts`; untranslated secondary text falls back to English.

## Credential safety

Keep credentials out of the repository. `.env.local`, Vercel project metadata, and Supabase CLI temporary files are ignored by Git. `.env.example` contains variable names only; it must remain free of real values. Never commit API keys, access tokens, passwords, private keys, or Supabase service-role/secret keys.
