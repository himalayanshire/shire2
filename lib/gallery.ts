import type { GalleryItem } from "./gallery-types";

/* ------------------------------------------------------------------ */
/*  Gallery — static. Images live in /public/gallery; the list and     */
/*  order below are what the former CMS served (same order as the      */
/*  seed). To add a photo: drop it in /public/gallery and add its      */
/*  filename here.                                                     */
/* ------------------------------------------------------------------ */

const GALLERY_FILES = [
  "attic-area-common.jpg",
  "bonfire.jpg",
  "common-balcony.jpg",
  "common-balcony-with-swing.jpg",
  "common-seating-first-floor.jpg",
  "decor.png",
  "dining-area.jpg",
  "enchanting-winter-views.jpg",
  "ground-floor-lobby.jpg",
  "himachali-style-seating.jpg",
  "indoor-games.jpeg",
  "lawn-with-outdoor-seating-1.jpg",
  "mesmerizing-views.jpg",
  "reception-area.png",
  "recreational-hall.jpg",
  "snow-view.jpg",
  "sunrise-view.png",
  "surrounded-by-greenery.jpg",
  "tv-lounge.jpg",
  "winters.jpg",
];

const STAMP = "2026-01-01T00:00:00.000Z";

const GALLERY_ITEMS: GalleryItem[] = GALLERY_FILES.map((file, index) => ({
  id: `gallery-${index}`,
  title: titleFromFile(file),
  category: categoryFromFile(file),
  src: `/gallery/${file}`,
  order: index,
  status: "published",
  createdAt: STAMP,
  updatedAt: STAMP,
}));

/** Get published gallery items for the public pages */
export async function getPublishedGalleryItems(): Promise<GalleryItem[]> {
  return GALLERY_ITEMS;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function titleFromFile(file: string): string {
  const name = file.replace(/\.[^.]+$/, "").replace(/-\d+$/, "");
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function categoryFromFile(file: string): string {
  const lower = file.toLowerCase();
  if (/(view|snow|winter|sunrise|mesmerizing|greenery|enchant)/.test(lower)) return "Views";
  if (/(bonfire|lawn|outdoor)/.test(lower)) return "Outdoor";
  if (/(dining|decor|tv|lounge|himachali|games|kitchen)/.test(lower)) return "Interiors";
  return "Common Spaces";
}
