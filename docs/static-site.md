# Static site (no database)

The site no longer uses Railway/MySQL, Prisma, or the admin panel. Every page is
prerendered at build time, so the site stays up with no database subscription.

The previous CMS-backed version is preserved in git as the tag
`pre-static-cms` (`git checkout pre-static-cms`).

## Where content lives now

| Content | File |
| --- | --- |
| Homepage section copy (hero, our story, rooms intro, amenities, setting, CTA, footer) | `data/homepage.json` |
| Blog posts | `data/blogs.json` |
| Gallery photos (list + order) | `lib/gallery.ts` (images in `public/gallery/`) |
| Rooms (details, facilities, photos) | `lib/rooms.ts` |
| Activities page | `lib/activities-content.ts` |
| Sustainability page | `lib/sustainability-content.ts` |
| FAQ | `lib/faq.tsx` |
| Instagram feed + Google reviews | `lib/social-feeds.ts` |
| Analytics IDs | `app/layout.tsx` (or `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GA4_ID`) |

To change content: edit the file, commit, push. Vercel redeploys automatically.

## Environment variables

None are required to build or serve the site. Only the contact/inquiry form needs
email credentials (`SMTP_USER` + `SMTP_PASSWORD`, or `RESEND_API_KEY`). Inquiries are
delivered by email only; they are no longer also stored in a database.

`DATABASE_URL` can be deleted from the Vercel project settings.

## What was removed

- `/admin` and every `/api/admin`, `/api/auth`, `/api/upload`, `/api/media`,
  `/api/blogs`, `/api/gallery`, `/api/homepage`, `/api/pages`, `/api/rooms` route
- `prisma/`, the seed and DB-check scripts, and the `@prisma/client`, `prisma`,
  `bcryptjs`, `jose` and `tsx` dependencies

## "Shire" chat assistant

A floating assistant (bottom-right, on every page) answers questions about the
homestay. Phone and WhatsApp buttons sit bottom-left.

- **Free, no key needed.** It uses public open-model endpoints (llm7.io, then
  Pollinations) from `app/api/shire/route.ts`. Nothing is stored on a server; the
  conversation lives in the visitor's browser tab only.
- **Answers come from the site's own data** (`lib/shire/knowledge.ts` is built from
  `lib/rooms.ts`, `lib/faq.tsx` and `lib/property.ts`). Update those and Shire
  updates with them. It is instructed never to invent prices or availability.
- **Free tiers rate-limit.** If the AI is busy, Shire answers from the FAQ locally
  (`lib/shire/fallback.ts`); if nothing matches it offers WhatsApp. For steadier
  answers, create a free key at console.groq.com and set `GROQ_API_KEY` in Vercel.
- Switch it off with `SHIRE_ENABLED=false`.
- Visitor messages are sent to the third-party AI provider; the chat warns visitors
  not to share personal or payment details.
