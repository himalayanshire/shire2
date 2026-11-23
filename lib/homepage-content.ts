import homepage from "../data/homepage.json";

/**
 * Homepage section copy. Static — read from data/homepage.json (a snapshot of
 * what the former CMS served). Edit that file and redeploy to change content.
 */
export async function getHomepageSections(): Promise<Record<string, any>> {
  return homepage as Record<string, any>;
}
