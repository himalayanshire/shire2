// lib/room-images.ts
import { rooms } from "./rooms";

export function isRoomSlug(slug: string): boolean {
  return rooms.some((r) => r.slug === slug);
}

export interface PublicRoomImage {
  src: string;
  caption: string | null;
  alt: string | null;
}

/** Image list shown on the public room page — the static set from lib/rooms.ts. */
export async function getPublicRoomImages(slug: string): Promise<PublicRoomImage[]> {
  const room = rooms.find((r) => r.slug === slug);
  return (room?.images ?? []).map((src) => ({ src, caption: null, alt: null }));
}
