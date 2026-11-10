export type ListInitialData = {
  /** Initial filters exactly as the client derives them from the URL. */
  filters: Record<string, string | null>;
  list: any;
  media: any;
  special?: any;
};

/**
 * Whether a list query is still at its server-rendered state (page 1, untouched
 * filters). react-query applies `initialData` to whatever key is active, so it
 * must only be supplied while this holds — otherwise page 2 would flash page 1.
 */
export function isInitialListState(
  page: number,
  filters: Record<string, unknown>,
  initial?: Record<string, unknown>,
) {
  if (!initial || page !== 1) return false;
  const keys = new Set([...Object.keys(filters), ...Object.keys(initial)]);
  for (const k of keys) {
    if ((filters[k] ?? null) !== (initial[k] ?? null)) return false;
  }
  return true;
}
