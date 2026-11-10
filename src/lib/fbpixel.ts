// Minimal Meta Pixel wrapper, replacing the unmaintained react-facebook-pixel
// (which touched window at import time and breaks SSR).

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean };
    _fbq?: unknown;
  }
}

let initialized = false;

export function initPixel(pixelId: string) {
  if (initialized || typeof window === "undefined") return;
  if (!window.fbq) {
    const fbq: Window["fbq"] = function (...args: unknown[]) {
      // @ts-expect-error fbq bootstrap shape
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq!.queue!.push(args);
    };
    fbq.queue = [] as unknown[];
    fbq.loaded = true;
    // @ts-expect-error fbq bootstrap shape
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
  window.fbq("init", pixelId);
  initialized = true;
}

export function pageView() {
  window.fbq?.("track", "PageView");
}

export function track(event: string, data?: Record<string, unknown>) {
  window.fbq?.("track", event, data);
}
