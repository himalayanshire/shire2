# The Himalayan Shire

Website for The Himalayan Shire, a boutique homestay in Fagu, near Shimla.
Built with Next.js (App Router), React, Tailwind CSS and Framer Motion.

The site is **fully static** — no database, CMS or admin panel. See
[docs/static-site.md](docs/static-site.md) for where each piece of content lives
and how to change it.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build and run

```bash
npm run build
npm start
```

## Deploy

Push to GitHub; Vercel builds and deploys automatically. No environment variables
are required. To enable the inquiry form, set `SMTP_USER` + `SMTP_PASSWORD` (or
`RESEND_API_KEY`) — see `.env.example`.

## Content

| What | Where |
| --- | --- |
| Homepage copy | `data/homepage.json` |
| Blog posts | `data/blogs.json` |
| Gallery | `lib/gallery.ts` + `public/gallery/` |
| Rooms | `lib/rooms.ts` |
| Activities / sustainability / FAQ | `lib/activities-content.ts`, `lib/sustainability-content.ts`, `lib/faq.tsx` |
| Instagram and Google reviews | `lib/social-feeds.ts` |

The earlier CMS/database version is kept at the git tag `pre-static-cms`.
