// Server-side fetcher for PUBLIC data, used by Server Components,
// generateMetadata, and sitemap. Keep auth'd requests on the client axios
// instance (src/server/api.ts).
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export type ServerFetchOptions = {
  /** Query params; empty/undefined values are stripped (DRF-style). */
  params?: Record<string, unknown>;
  /** ISR revalidation window in seconds. Defaults to 300. Pass 0 for no caching. */
  revalidate?: number;
  /** Next cache tags for on-demand revalidation. */
  tags?: string[];
};

export async function serverFetch<T = unknown>(
  path: string,
  { params, revalidate = 300, tags }: ServerFetchOptions = {},
): Promise<T> {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate, tags },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status} for ${url.pathname}${url.search}`);
  }

  return res.json() as Promise<T>;
}

/** Like serverFetch but returns null instead of throwing (for optional data / notFound flows). */
export async function serverFetchOrNull<T = unknown>(
  path: string,
  options?: ServerFetchOptions,
): Promise<T | null> {
  try {
    return await serverFetch<T>(path, options);
  } catch {
    return null;
  }
}
