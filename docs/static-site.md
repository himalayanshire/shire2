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
