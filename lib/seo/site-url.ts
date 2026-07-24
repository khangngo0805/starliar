export const defaultSiteUrl = "https://wwwstarlier.com";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const url = configuredUrl || defaultSiteUrl;

  return url.replace(/\/+$/, "");
}
