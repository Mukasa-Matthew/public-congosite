/** Optional full URL to XML RSS/Atom feed (often served by the same API/backend). */
export function getRssFeedUrl(): string | null {
  const fromEnv = import.meta.env.VITE_RSS_FEED_URL as string | undefined;
  if (fromEnv?.trim()) return fromEnv.trim();
  return null;
}
