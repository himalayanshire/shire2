import { NextResponse } from "next/server";

// The site is fully static and has no database, so it is up whenever it can
// answer this request.
export async function GET() {
  return NextResponse.json({ ok: true, status: "up" });
}
