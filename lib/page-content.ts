// lib/page-content.ts
//
// The activities and sustainability pages used to accept CMS overrides.
// With the CMS removed they always render their built-in content
// (lib/activities-content.ts, lib/sustainability-content.ts), so there is
// never an override to return.

const ALLOWED_KEYS = ["activities", "sustainability"];

export function isPageKey(key: string): boolean {
  return ALLOWED_KEYS.includes(key);
}

export async function getPageContent(
  _key: string
): Promise<Record<string, unknown> | null> {
  return null;
}
