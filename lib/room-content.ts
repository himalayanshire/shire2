// lib/room-content.ts
//
// Room copy is static, defined in lib/rooms.ts. (The CMS used to layer
// per-room overrides on top; with it removed, the base data is the content.)
import { rooms } from "./rooms";

export type Room = (typeof rooms)[number];

export async function getMergedRoom(slug: string): Promise<Room | null> {
  return rooms.find((r) => r.slug === slug) ?? null;
}

export async function getMergedRooms(): Promise<Room[]> {
  return rooms;
}
