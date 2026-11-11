/** Routes that require a session. Shared by proxy.ts (server guard) and the client logout redirect. */
export const PROTECTED_PREFIXES = ["/profile", "/property/create", "/property/edit"];

/** `path` must be locale-less (no /ar prefix). */
export const isProtectedPath = (path: string) =>
  PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
