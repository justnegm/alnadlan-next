import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import { Baby, Bus, ChevronDown, Landmark, Loader2, Map as MapIcon, MapPin, Satellite, School, TrendingUp, X } from 'lucide-react';
import proj4 from 'proj4';

// Register EPSG:2039 (Israel Transverse Mercator) if not already registered
if (!proj4.defs('EPSG:2039')) {
    proj4.defs(
        'EPSG:2039',
        '+proj=tmerc +lat_0=31.73439361111111 +lon_0=35.20451694444445 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +towgs84=23.8085,17.5937,17.8010,-0.3306,-1.85706,1.64828,-5.4374'
    );
}

/** Converts ITM (EPSG:2039) coordinates to Web Mercator (EPSG:3857) for GovMap's store / OpenLayers */
const itmToWebMercator = (x: number, y: number): [number, number] => {
    try {
        const [mx, my] = proj4('EPSG:2039', 'EPSG:3857', [x, y]);
        return [parseFloat(mx.toFixed(2)), parseFloat(my.toFixed(2))];
    } catch {
        return [x, y];
    }
};

/**
 * GovMap JS API typings — based on the official docs:
 * https://api.govmap.gov.il/docs/intro/javascript-functions
 * Enum values: https://api.govmap.gov.il/docs/intro/attache-b
 */
type GovMapPromise<T = any> = { then: (cb: (res: T) => void) => any; catch?: (cb: (err: any) => void) => any };

interface GovMapApi {
    createMap: (mapDivId: string, settings: Record<string, unknown>) => void;
    setBackground?: (backgroundType: number | string, mapDivId?: string) => void;
    getBackground?: (mapDivId?: string) => GovMapPromise;
    search?: (params: { apiKey: string; searchText: string; language?: 'he' | 'en'; maxResults?: number; isAccurate?: boolean }) => GovMapPromise;
    geocode: (params: { keyword: string; type: number }) => GovMapPromise;
    zoomToXY: (params: { x: number; y: number; level?: number; marker?: boolean }) => void;
    setMapMarker: (params: { x: number; y: number }) => void;
    clearMapMarker?: () => void;
    displayGeometries: (data: Record<string, unknown>) => GovMapPromise;
    clearGeometriesByName?: (names: string[]) => void;
    identifyByXYAndLayer: (x: number, y: number, layers: string[]) => GovMapPromise;
    identifyByXY?: (x: number, y: number, mapDivId?: string) => GovMapPromise;
    searchAndLocate: (params: Record<string, unknown>) => GovMapPromise;
    getLayerData: (params: { LayerName: string; Point: { x: number; y: number }; Radius: number }) => GovMapPromise;
    setVisibleLayers?: (layersOn: string[], layersOff?: string[], mapDivId?: string) => void;
    applyBubbleState?: (params: { layers: string[]; point?: [number, number]; fieldQuery?: { field: string; value: string } }, mapDivId?: string) => void;
    closeBubble?: (mapDivId?: string) => void;
    geocodeType?: { FullResult: number; AccuracyOnly: number };
    geometryType?: { POINT: number; POLYLINE: number; POLYGON: number; LINE: number; CIRCLE: number };
    locateType?: { addressToLotParcel: number; lotParcelToAddress: number };
    events?: { PAN: number; EXTENT_CHANGE: number; [key: string]: number };
    onEvent?: (event: number, mapDivId?: string) => { progress?: (cb: (data: any) => void) => any };
    unbindEvent?: (event: number, mapDivId?: string) => void;
    getCenter?: (mapDivId?: string) => GovMapPromise;
}

declare global {
    interface Window {
        govmap?: GovMapApi;
    }
}

interface GovMapProps {
    address: string;
    /** Optional label shown in the info bubble / overlay (e.g. project or property name) */
    title?: string;
}

interface NearbyInfo {
    schools: number | null;
    kindergartens: number | null;
    busStops: number | null;
}

interface PlaceDetails {
    gush?: number | string;
    helka?: number | string;
    nearby: NearbyInfo;
}

type XY = { x: number; y: number };

const MAP_TOKEN = import.meta.env.VITE_MAP_API_KEY;
const MAP_DIV_ID = 'map-container';
const NEARBY_RADIUS = 500; // meters

// Names used for our own geometries, so we can clear/redraw them
const GEOM = {
    neighborhood: 'alnadlan-neighborhood',
    parcel: 'alnadlan-parcel',
    marker: 'alnadlan-marker',
};

// GovMap background mode IDs:
// 2 = Combined / Hybrid (תצלום אוויר משולב - realistic aerial imagery with street names & building labels)
// 1 = Orthophoto (תצלום אוויר - pure aerial photography)
// 0 = Streets & Buildings (רחובות ומבנים - vector map)
const BG_MODES = {
    HYBRID: 2,
    SATELLITE: 1,
    STREETS: 0,
} as const;

// Public layer IDs and aliases from GovMap
const LAYERS = {
    nadlan: 'nadlan',
    nadlanId: '16',
    school: 'school',
    schoolId: '17',
    kindergarten: 'kids_g',
    kindergartenId: '18',
    busStops: 'bus_stops',
    busStopsId: '20',
    parcels: 'PARCEL_ALL',
    parcelId: '15',
    gush: 'SUB_GUSH_ALL',
    gushId: '21',
    neighborhoods: 'neighborhoods_area',
    neighborhoodsId: '22',
};

const DEFAULT_ACTIVE_LAYERS = [
    LAYERS.nadlan,
    LAYERS.nadlanId,
    LAYERS.school,
    LAYERS.schoolId,
    LAYERS.kindergarten,
    LAYERS.kindergartenId,
    LAYERS.busStops,
    LAYERS.busStopsId,
];

const TEXT = {
    here: 'הפרויקט כאן',
    address: 'כתובת',
    gush: 'גוש',
    helka: 'חלקה',
    schools: 'בתי ספר',
    kindergartens: 'גני ילדים',
    busStops: 'תחנות אוטובוס',
    within: `ברדיוס ${NEARBY_RADIUS} מ'`,
    locating: 'מאתר כתובת...',
    notFound: 'לא נמצא מיקום מדויק לכתובת',
    nadlanDeals: 'עסקאות נדל״ן',
    openNadlanTooltip: 'הצג עסקאות נדל״ן בסביבה',
    satelliteView: 'לוויין',
    satelliteTooltip: 'תצלום אוויר ריאליסטי משולב עם שמות רחובות ומבנים',
    streetsView: 'מפה',
    streetsTooltip: 'מפת רחובות ומבנים',
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Wraps a GovMap thenable in a real Promise with a timeout, so a silent API never blocks us. */
const toPromise = <T,>(fn: () => GovMapPromise<T> | undefined, ms = 8000): Promise<T> =>
    new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('GovMap request timed out')), ms);
        try {
            const res = fn();
            if (!res || typeof res.then !== 'function') {
                clearTimeout(timer);
                reject(new Error('GovMap function did not return a promise'));
                return;
            }
            res.then((value: T) => {
                clearTimeout(timer);
                resolve(value);
            });
            res.catch?.((err: any) => {
                clearTimeout(timer);
                reject(err);
            });
        } catch (err) {
            clearTimeout(timer);
            reject(err);
        }
    });

/** Parses "POINT (x y)" (as returned by govmap.search `centroid`). */
const parsePointWkt = (wkt?: string): XY | null => {
    const m = wkt?.match(/POINT\s*\(\s*([\d.]+)\s+([\d.]+)\s*\)/i);
    return m ? { x: Number(m[1]), y: Number(m[2]) } : null;
};

/** The geocode response shape is not documented, so search it for the first object with numeric X/Y. */
const findXY = (node: any, depth = 0): XY | null => {
    if (!node || depth > 5) return null;
    if (Array.isArray(node)) {
        for (const item of node) {
            const found = findXY(item, depth + 1);
            if (found) return found;
        }
        return null;
    }
    if (typeof node === 'object') {
        const x = Number(node.X ?? node.x);
        const y = Number(node.Y ?? node.y);
        if (Number.isFinite(x) && Number.isFinite(y) && x > 0 && y > 0) return { x, y };
        for (const key of Object.keys(node)) {
            const found = findXY(node[key], depth + 1);
            if (found) return found;
        }
    }
    return null;
};

/**
 * Converts a POLYGON / MULTIPOLYGON WKT into a single-ring POLYGON WKT
 * (outer ring of the first polygon), which is what displayGeometries + geometryType.POLYGON expects.
 */
const toPolygonWkt = (wkt?: string): string | null => {
    if (!wkt || !/POLYGON/i.test(wkt)) return null;
    const ring = wkt.match(/\(\s*([-\d.]+\s+[-\d.]+(?:\s*,\s*[-\d.]+\s+[-\d.]+)+)\s*\)/);
    return ring ? `POLYGON((${ring[1]}))` : null;
};

/** Pulls the first polygon geometry out of an identifyByXYAndLayer response. */
const findPolygonInIdentify = (res: any): string | null => {
    const layers = Array.isArray(res?.data) ? res.data : [];
    for (const layer of layers) {
        for (const entity of layer?.entities ?? []) {
            const wkt = toPolygonWkt(entity?.geom);
            if (wkt) return wkt;
        }
    }
    return null;
};

/**
 * Clean gold pin marker rendered as an SVG data-url for displayGeometries.
 * Picture symbols are centered on the point by GovMap, so the 72px tall SVG
 * has its pin tip and ground contact shadow exactly at y = 36 (the vertical center).
 */
const buildPinSymbol = () => {
    const width = 36;
    const height = 72; // center (the anchor point) is at y = 36
    const mid = width / 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <filter id="p-sh" x="-30%" y="-20%" width="160%" height="160%">
    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/>
  </filter>
</defs>
<ellipse cx="${mid}" cy="36" rx="6" ry="2.5" fill="#000000" opacity="0.3"/>
<g filter="url(#p-sh)">
  <path d="M ${mid} 35 C ${mid - 2} 30 5 18 5 13 A 13 13 0 1 1 31 13 C 31 18 ${mid + 2} 30 ${mid} 35 Z" fill="#A97A36" stroke="#ffffff" stroke-width="2"/>
  <circle cx="${mid}" cy="13" r="4.5" fill="#ffffff"/>
</g>
</svg>`;
    return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, width, height };
};

/** Helper to extract bounding box extent ({ xmin, ymin, xmax, ymax }) from any GovMap event or message */
const extractExtent = (e: any): { xmin: number; ymin: number; xmax: number; ymax: number } | null => {
    if (!e) return null;
    const candidates = [e.extent, e.data?.extent, e.data, e.detail?.extent, e.detail, e];
    for (const obj of candidates) {
        if (!obj || typeof obj !== 'object') continue;
        const xmin = Number(obj.xmin ?? obj.xMin ?? obj.XMin);
        const xmax = Number(obj.xmax ?? obj.xMax ?? obj.XMax);
        const ymin = Number(obj.ymin ?? obj.yMin ?? obj.YMin);
        const ymax = Number(obj.ymax ?? obj.yMax ?? obj.YMax);
        if (Number.isFinite(xmin) && Number.isFinite(xmax) && Number.isFinite(ymin) && Number.isFinite(ymax) && xmax > xmin && ymax > ymin) {
            return { xmin, xmax, ymin, ymax };
        }
    }
    return null;
};

const MapComponent: FC<GovMapProps> = ({ address, title }) => {
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [bgMode, setBgMode] = useState<number>(BG_MODES.HYBRID);
    const [status, setStatus] = useState<'idle' | 'locating' | 'found' | 'notFound'>('idle');
    const [details, setDetails] = useState<PlaceDetails | null>(null);
    const [, setMarkerPoint] = useState<XY | null>(null);
    const [markerPixel, setMarkerPixel] = useState<XY | null>(null);
    const [isCardOpen, setIsCardOpen] = useState(false);
    const [isDealsOpen, setIsDealsOpen] = useState(false);

    const containerRef = useRef<HTMLElement | null>(null);
    const markerPointRef = useRef<XY | null>(null);
    const lastPointRef = useRef<XY | null>(null);
    const currentExtentRef = useRef<{ xmin: number; ymin: number; xmax: number; ymax: number } | null>(null);
    const requestId = useRef(0);

    /**
     * Selects and opens the real estate deals ("עסקאות נדל״ן") bubble
     * for the address based on its geographic coordinates.
     */
    const triggerNadlanDeals = useCallback((targetPoint?: XY) => {
        const pt = targetPoint || lastPointRef.current;
        const gm = window.govmap;
        if (!pt || !gm) return;

        // Ensure real estate transactions layer is visible
        try {
            gm.setVisibleLayers?.(DEFAULT_ACTIVE_LAYERS, []);
        } catch {
            /* ignore */
        }

        // Convert ITM (EPSG:2039) -> Web Mercator (EPSG:3857) for GovMap's store and OpenLayers
        const [nativeX, nativeY] = itmToWebMercator(pt.x, pt.y);

        try {
            gm.applyBubbleState?.(
                {
                    layers: [LAYERS.nadlan, LAYERS.nadlanId],
                    point: [nativeX, nativeY],
                },
                MAP_DIV_ID
            );
            setIsDealsOpen(true);
        } catch (err) {
            console.warn('GovMap applyBubbleState error:', err);
        }
    }, []);

    const closeNadlanDeals = useCallback(() => {
        const gm = window.govmap;
        try {
            gm?.closeBubble?.(MAP_DIV_ID);
        } catch {
            /* ignore */
        }
        try {
            gm?.closeBubble?.();
        } catch {
            /* ignore */
        }
        setIsDealsOpen(false);
    }, []);

    /** Converts geographic ITM coordinates to container pixel coordinates using map extent */
    const updatePositionFromExtent = useCallback((extent: { xmin: number; ymin: number; xmax: number; ymax: number }) => {
        currentExtentRef.current = extent;
        const pt = markerPointRef.current;
        const container = containerRef.current || document.getElementById(MAP_DIV_ID);
        if (!pt || !container) return;

        const { xmin, ymin, xmax, ymax } = extent;
        if (xmax <= xmin || ymax <= ymin) return;

        const rect = container.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        // Israel Transverse Mercator (EPSG:2039) is Cartesian metric grid:
        // x goes east (left to right), y goes north (bottom to top)
        const px = ((pt.x - xmin) / (xmax - xmin)) * rect.width;
        const py = ((ymax - pt.y) / (ymax - ymin)) * rect.height;

        setMarkerPixel({ x: px, y: py });
    }, []);

    const onMapMovement = useCallback(
        (e: any) => {
            if (!e) return;
            const ext = extractExtent(e);
            if (ext) {
                updatePositionFromExtent(ext);
                return;
            }
            // Fallback for delta shifts
            const dx = Number(e.delta?.x ?? e.deltaX ?? e.dx);
            const dy = Number(e.delta?.y ?? e.deltaY ?? e.dy);
            if (Number.isFinite(dx) && Number.isFinite(dy) && (dx !== 0 || dy !== 0)) {
                setMarkerPixel((prev) => (prev ? { x: prev.x - dx, y: prev.y - dy } : prev));
            }
        },
        [updatePositionFromExtent]
    );

    const applyBackground = useCallback((mode: number) => {
        const gm = window.govmap;
        if (!gm || typeof gm.setBackground !== 'function') return;
        try {
            gm.setBackground(mode);
        } catch {
            try {
                gm.setBackground(mode, MAP_DIV_ID);
            } catch (err) {
                console.warn('Failed to set GovMap background:', err);
            }
        }
    }, []);

    const switchBackground = useCallback(
        (mode: number) => {
            setBgMode(mode);
            applyBackground(mode);
        },
        [applyBackground]
    );

    // 0) Prevent GovMap iframe and its internals from auto-scrolling the parent page when loading
    useEffect(() => {
        // Intercept scrollIntoView called on the map container or its descendants
        const originalScrollIntoView = Element.prototype.scrollIntoView;
        Element.prototype.scrollIntoView = function (arg?: boolean | ScrollIntoViewOptions) {
            const mapEl = containerRef.current || document.getElementById(MAP_DIV_ID);
            if (mapEl && (this === mapEl || mapEl.contains(this as Node))) {
                return;
            }
            return originalScrollIntoView.call(this, arg);
        };

        // Intercept focus called on map elements to ensure preventScroll is always set
        const originalFocus = HTMLElement.prototype.focus;
        HTMLElement.prototype.focus = function (options?: FocusOptions) {
            const mapEl = containerRef.current || document.getElementById(MAP_DIV_ID);
            if (mapEl && (this === mapEl || mapEl.contains(this as Node))) {
                return originalFocus.call(this, { ...options, preventScroll: true });
            }
            return originalFocus.call(this, options);
        };

        // Observe iframe addition to add tabindex="-1" and loading="lazy"
        const mapDiv = document.getElementById(MAP_DIV_ID);
        let observer: MutationObserver | null = null;
        if (mapDiv) {
            observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node instanceof HTMLElement) {
                            if (node.tagName === 'IFRAME') {
                                (node as HTMLIFrameElement).tabIndex = -1;
                                node.setAttribute('tabindex', '-1');
                                node.setAttribute('loading', 'lazy');
                            }
                            const iframes = node.querySelectorAll?.('iframe');
                            iframes?.forEach((iframe) => {
                                iframe.tabIndex = -1;
                                iframe.setAttribute('tabindex', '-1');
                                iframe.setAttribute('loading', 'lazy');
                            });
                        }
                    }
                }
            });
            observer.observe(mapDiv, { childList: true, subtree: true });
        }

        return () => {
            observer?.disconnect();
            Element.prototype.scrollIntoView = originalScrollIntoView;
            HTMLElement.prototype.focus = originalFocus;
        };
    }, []);

    // 1) Create the map (https://api.govmap.gov.il/docs/javascript-functions/create-map)
    useEffect(() => {
        let attempts = 0;
        let isReady = false;
        let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

        const activateSelectedLayers = () => {
            const gm = window.govmap;
            if (!gm || typeof gm.setVisibleLayers !== 'function') return;
            try {
                gm.setVisibleLayers(DEFAULT_ACTIVE_LAYERS, []);
            } catch (err) {
                console.warn('Failed to call setVisibleLayers:', err);
            }
        };

        const markReady = () => {
            if (!isReady) {
                isReady = true;
                setIsMapLoaded(true);
                applyBackground(BG_MODES.HYBRID);
                activateSelectedLayers();
            }
        };

        const checkGovMap = setInterval(() => {
            attempts++;
            if (window.govmap) {
                clearInterval(checkGovMap);
                const isDesktop = window.innerWidth >= 768;
                window.govmap.createMap(MAP_DIV_ID, {
                    token: MAP_TOKEN,
                    level: 2,
                    showXY: false,
                    identifyOnClick: true,
                    zoomButtons: true,
                    bgButton: false,
                    background: '2', // 2 = Hybrid (realistic aerial photography with street labels)
                    isEmbeddedToggle: isDesktop,
                    layersMode: isDesktop ? 2 : 1,
                    layers: Object.values(LAYERS),
                    visibleLayers: DEFAULT_ACTIVE_LAYERS,
                    onLoad: markReady,
                    onPan: onMapMovement,
                    onError: (err: any) => console.error('GovMap initialization error:', err),
                });
                // Safety net in case onLoad never fires
                fallbackTimer = setTimeout(markReady, 4000);
            } else if (attempts > 100) {
                clearInterval(checkGovMap);
                console.error('GovMap script failed to load.');
            }
        }, 100);

        return () => {
            clearInterval(checkGovMap);
            if (fallbackTimer) clearTimeout(fallbackTimer);
        };
    }, [onMapMovement]);

    // 2a) Ensure selected layers (including real estate deals / עסקאות נדל״ן) are explicitly activated
    useEffect(() => {
        if (!isMapLoaded) return;
        const activate = () => {
            try {
                window.govmap?.setVisibleLayers?.(DEFAULT_ACTIVE_LAYERS, []);
            } catch {
                /* ignore */
            }
        };
        activate();
        applyBackground(bgMode);
        const t1 = setTimeout(() => {
            activate();
            applyBackground(bgMode);
        }, 400);
        const t2 = setTimeout(() => {
            activate();
            applyBackground(bgMode);
        }, 1200);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [isMapLoaded, bgMode, applyBackground]);

    // 2) Listen to map movement events (pan, zoom, extent change, window resize)
    useEffect(() => {
        const gm = window.govmap;
        if (!isMapLoaded || !gm) return;

        try {
            const events = gm.events || { PAN: 0, EXTENT_CHANGE: 1 };
            if (typeof gm.onEvent === 'function') {
                gm.onEvent(events.PAN, MAP_DIV_ID)?.progress?.(onMapMovement);
                gm.onEvent(events.EXTENT_CHANGE, MAP_DIV_ID)?.progress?.(onMapMovement);
                gm.onEvent(events.PAN)?.progress?.(onMapMovement);
                gm.onEvent(events.EXTENT_CHANGE)?.progress?.(onMapMovement);
            }
        } catch (err) {
            console.warn('Failed to bind GovMap movement events:', err);
        }

        const handleWindowMsg = (ev: MessageEvent) => {
            try {
                const d = ev.data;
                if (!d) return;
                const ext = extractExtent(d) || extractExtent(d.data);
                if (ext) {
                    updatePositionFromExtent(ext);
                }
            } catch {
                /* ignore */
            }
        };
        window.addEventListener('message', handleWindowMsg);

        const handleResize = () => {
            if (currentExtentRef.current) {
                updatePositionFromExtent(currentExtentRef.current);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('message', handleWindowMsg);
            window.removeEventListener('resize', handleResize);
            try {
                const events = gm.events || { PAN: 0, EXTENT_CHANGE: 1 };
                if (typeof gm.unbindEvent === 'function') {
                    gm.unbindEvent(events.PAN, MAP_DIV_ID);
                    gm.unbindEvent(events.EXTENT_CHANGE, MAP_DIV_ID);
                    gm.unbindEvent(events.PAN);
                    gm.unbindEvent(events.EXTENT_CHANGE);
                }
            } catch {
                /* ignore */
            }
        };
    }, [isMapLoaded, onMapMovement, updatePositionFromExtent]);

    // 3) Locate the address → marker → highlight parcel/neighborhood → details
    useEffect(() => {
        const gm = window.govmap;
        if (!isMapLoaded || !gm || !address || address.includes('undefined')) return;

        const id = ++requestId.current;
        const isStale = () => id !== requestId.current;

        /** Address → ITM coordinates. Tries govmap.search (documented response) then govmap.geocode. */
        const locateString = async (q: string): Promise<XY | null> => {
            if (typeof gm.search === 'function') {
                try {
                    const res: any = await toPromise(() =>
                        gm.search!({ apiKey: MAP_TOKEN, searchText: q, language: 'he', maxResults: 1, isAccurate: false })
                    );
                    const point = parsePointWkt(res?.results?.[0]?.centroid);
                    if (point) {
                        console.log('GovMap search found:', q);
                        return point;
                    }
                } catch (err) {
                    console.warn('GovMap search failed for:', q, err);
                }
            }
            for (const type of [gm.geocodeType?.AccuracyOnly ?? 1, gm.geocodeType?.FullResult ?? 0]) {
                try {
                    const res = await toPromise(() => gm.geocode({ keyword: q, type }));
                    const point = findXY(res);
                    if (point) {
                        console.log('GovMap geocode found:', q, type);
                        return point;
                    }
                } catch (err) {
                    console.warn('GovMap geocode failed for:', q, err);
                }
            }
            return null;
        };

        const locate = async (): Promise<XY | null> => {
            // 1) Try exact address
            let point = await locateString(address);
            if (point) return point;

            // 2) Try removing numbers (e.g. house number)
            const noNumbers = address.replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
            // clean up any dangling commas
            const cleanNoNumbers = noNumbers.replace(/\s*,\s*,/g, ',').replace(/(^,|,$)/g, '').trim();
            if (cleanNoNumbers && cleanNoNumbers !== address) {
                point = await locateString(cleanNoNumbers);
                if (point) return point;
            }

            const parts = address.split(',');
            if (parts.length > 0) {
                // 3) Try just the city (last part)
                const city = parts[parts.length - 1].trim();
                if (city) {
                    point = await locateString(city);
                    if (point) return point;

                    // 4) Try city without parentheses (e.g. "אבו סריחאן (שבט)" -> "אבו סריחאן")
                    const cityNoParens = city.replace(/\([^)]*\)/g, '').trim();
                    if (cityNoParens && cityNoParens !== city) {
                        point = await locateString(cityNoParens);
                        if (point) return point;
                    }
                }

                // 5) Try just the street (first part)
                const street = parts[0].replace(/\d+/g, '').trim();
                if (street && street !== city) {
                    point = await locateString(street);
                    if (point) return point;

                    const streetNoParens = street.replace(/\([^)]*\)/g, '').trim();
                    if (streetNoParens && streetNoParens !== street) {
                        point = await locateString(streetNoParens);
                        if (point) return point;
                    }
                }
            }

            return null;
        };

        const drawLabel = (x: number, y: number) =>
            toPromise(() =>
                gm.displayGeometries({
                    wkts: [`POINT(${x} ${y})`],
                    names: [GEOM.marker],
                    geometryType: gm.geometryType?.POINT ?? 0,
                    defaultSymbol: buildPinSymbol(),
                    symbols: [],
                    clearExisting: false,
                    clearExistings: false,
                    showBubble: false,
                    zoom: false,
                    isZoom: false,
                })
            );

        const drawPolygon = (wkt: string, name: string, outline: number[], fill: number[], width: number) =>
            toPromise(() =>
                gm.displayGeometries({
                    wkts: [wkt],
                    names: [name],
                    geometryType: gm.geometryType?.POLYGON ?? 2,
                    defaultSymbol: { outlineColor: outline, outlineWidth: width, fillColor: fill },
                    symbols: [],
                    clearExisting: false,
                    clearExistings: false,
                    showBubble: false,
                    zoom: false,
                    isZoom: false,
                })
            );

        /** identifyByXYAndLayer is zoom-sensitive, so it's called after zooming in. */
        const identifyPolygon = async (x: number, y: number, layer: string) => {
            for (const name of [layer, layer.toLowerCase()]) {
                try {
                    const res = await toPromise(() => gm.identifyByXYAndLayer(x, y, [name]));
                    const wkt = findPolygonInIdentify(res);
                    if (wkt) return wkt;
                } catch (err) {
                    console.warn(`GovMap identify (${name}) failed:`, err);
                }
            }
            return null;
        };

        const run = async () => {
            setStatus('locating');
            setDetails(null);
            setMarkerPoint(null);
            setMarkerPixel(null);
            markerPointRef.current = null;

            // Clear previous drawings (when the address changes)
            try {
                gm.clearGeometriesByName?.(Object.values(GEOM));
                gm.clearMapMarker?.();
            } catch {
                /* ignore */
            }

            const point = await locate();
            if (isStale()) return;
            if (!point) {
                setStatus('notFound');
                return;
            }
            const { x, y } = point;
            markerPointRef.current = point;
            lastPointRef.current = point;
            setMarkerPoint(point);
            setIsCardOpen(false);

            // 1. Draw the sleek pin marker first
            await drawLabel(x, y).catch((err) => {
                console.warn('GovMap pin marker failed:', err);
                gm.setMapMarker({ x, y });
            });

            // 2. Zoom to the exact point (level 10) AFTER drawing the pin
            gm.zoomToXY({ x, y, level: 10, marker: false });
            setStatus('found');

            // Set initial marker pixel position at the exact container center
            const container = containerRef.current || document.getElementById(MAP_DIV_ID);
            if (container) {
                const rect = container.getBoundingClientRect();
                setMarkerPixel({ x: rect.width / 2, y: rect.height / 2 });
            }

            // 3. Automatically select and open "עסקאות נדל״ן" (real estate deals) at the address on desktop
            await sleep(800);
            if (isStale()) return;
            if (window.innerWidth >= 768) {
                triggerNadlanDeals(point);
            }

            // 4. Highlight the parcel of the address + its neighborhood
            await sleep(400); // let the zoom settle (identify depends on current zoom)
            if (isStale()) return;

            const [neighborhoodWkt, parcelWkt] = await Promise.all([
                identifyPolygon(x, y, LAYERS.neighborhoods),
                identifyPolygon(x, y, LAYERS.parcels),
            ]);
            if (isStale()) return;

            if (neighborhoodWkt) {
                await drawPolygon(neighborhoodWkt, GEOM.neighborhood, [169, 122, 54, 0.6], [240, 222, 180, 0.35], 3).catch((e) =>
                    console.warn('GovMap neighborhood highlight failed:', e)
                );
            }
            if (parcelWkt) {
                await drawPolygon(parcelWkt, GEOM.parcel, [169, 122, 54, 1], [169, 122, 54, 0.35], 3).catch((e) =>
                    console.warn('GovMap parcel highlight failed:', e)
                );
            } else {
                // No parcel polygon available → highlight a small area around the address
                await toPromise(() =>
                    gm.displayGeometries({
                        circleGeometries: [{ x, y, radius: 40 }],
                        names: [GEOM.parcel],
                        geometryType: gm.geometryType?.CIRCLE ?? 4,
                        defaultSymbol: { outlineColor: [169, 122, 54, 1], outlineWidth: 3, fillColor: [169, 122, 54, 0.3] },
                        symbols: [],
                        clearExisting: false,
                        clearExistings: false,
                        showBubble: false,
                        zoom: false,
                        isZoom: false,
                    })
                ).catch((e) => console.warn('GovMap area highlight failed:', e));
            }

            // Enforce the zoom and ensure real estate deals bubble is open on desktop
            if (!isStale()) {
                gm.zoomToXY({ x, y, level: 10, marker: false });
                if (window.innerWidth >= 768) {
                    triggerNadlanDeals(point);
                }
            }

            // 4. Details: gush/helka + nearby amenities
            const countLayer = (LayerName: string) =>
                toPromise(() => gm.getLayerData({ LayerName, Point: { x, y }, Radius: NEARBY_RADIUS })).then((res: any) =>
                    Array.isArray(res?.data) ? res.data.length : Array.isArray(res) ? res.length : null
                );

            const [parcelRes, schools, kindergartens, busStops] = await Promise.allSettled([
                toPromise(() => gm.searchAndLocate({ type: gm.locateType?.lotParcelToAddress ?? 0, address })),
                countLayer(LAYERS.school),
                countLayer(LAYERS.kindergarten),
                countLayer(LAYERS.busStops),
            ]);
            if (isStale()) return;

            const parcel: any = parcelRes.status === 'fulfilled' ? (parcelRes.value as any)?.data?.[0] : null;
            const info: PlaceDetails = {
                gush: parcel?.Values?.[0],
                helka: parcel?.Values?.[1],
                nearby: {
                    schools: schools.status === 'fulfilled' ? schools.value : null,
                    kindergartens: kindergartens.status === 'fulfilled' ? kindergartens.value : null,
                    busStops: busStops.status === 'fulfilled' ? busStops.value : null,
                },
            };
            setDetails(info);

            // 5. Redraw the pin on top of the polygons so it is never covered
            try {
                gm.clearGeometriesByName?.([GEOM.marker]);
            } catch {
                /* ignore */
            }
            drawLabel(x, y).catch((err) => console.warn('GovMap pin redraw failed:', err));
        };

        run();
    }, [isMapLoaded, address]);

    const nearbyItems = details
        ? [
              { icon: School, label: TEXT.schools, value: details.nearby.schools },
              { icon: Baby, label: TEXT.kindergartens, value: details.nearby.kindergartens },
              { icon: Bus, label: TEXT.busStops, value: details.nearby.busStops },
          ].filter((i) => i.value != null)
        : [];

    const container = containerRef.current;
    const containerWidth = container ? container.clientWidth : 0;
    const containerHeight = container ? container.clientHeight : 0;

    // Is the marker within visible bounds (+ generous threshold for smooth enter/exit)
    const isMarkerVisible = Boolean(
        markerPixel &&
            containerWidth > 0 &&
            containerHeight > 0 &&
            markerPixel.x >= -80 &&
            markerPixel.x <= containerWidth + 80 &&
            markerPixel.y >= -80 &&
            markerPixel.y <= containerHeight + 80
    );

    // Position above pin if there is enough space, else below
    const isAbove = markerPixel ? markerPixel.y >= 210 : true;

    // Clamp horizontal position so the card never clips outside the map container
    const cardHalfWidth = 140;
    const clampedX = markerPixel
        ? containerWidth > 300
            ? Math.max(cardHalfWidth + 12, Math.min(containerWidth - cardHalfWidth - 12, markerPixel.x))
            : markerPixel.x
        : 0;
    const arrowOffset = markerPixel ? markerPixel.x - clampedX : 0;
    const clampedArrowOffset = Math.max(-cardHalfWidth + 24, Math.min(cardHalfWidth - 24, arrowOffset));

    return (
        <section
            ref={containerRef}
            dir='ltr'
            className='relative h-105 sm:h-115 lg:h-125 max-w-400 w-[92%] sm:w-[90%] mx-auto rounded-2xl border border-zinc-300 overflow-hidden shadow-sm'
        >
            <div
                id={MAP_DIV_ID}
                className='absolute top-0 left-0 w-[142.857%] h-[142.857%] scale-[0.7] origin-top-left sm:static sm:w-full sm:h-full sm:scale-100'
            />

            {/* Locating pill indicator */}
            {status === 'locating' && (
                <div
                    dir='rtl'
                    className='pointer-events-none absolute top-3 right-1/2 translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md border border-[#A97A36]/30 shadow-md px-3.5 py-1.5 text-xs text-zinc-800 animate-in fade-in duration-200'
                >
                    <Loader2 className='h-3.5 w-3.5 animate-spin text-[#A97A36]' />
                    <span className='font-medium'>{TEXT.locating}</span>
                </div>
            )}

            {/* Not found indicator */}
            {status === 'notFound' && (
                <div
                    dir='rtl'
                    className='pointer-events-none absolute top-3 right-1/2 translate-x-1/2 z-20 rounded-xl bg-white/95 backdrop-blur-md border border-amber-300 shadow-md px-3.5 py-2 text-xs text-zinc-800 animate-in fade-in duration-200 max-w-[85%]'
                >
                    <span className='text-amber-700 font-semibold'>{TEXT.notFound}:</span> {address}
                </div>
            )}

            {/* Quick action button to select/toggle "עסקאות נדל״ן" (top-left) */}
            {status === 'found' && (
                <button
                    type='button'
                    dir='rtl'
                    onClick={() => (isDealsOpen ? closeNadlanDeals() : triggerNadlanDeals())}
                    title={TEXT.openNadlanTooltip}
                    className={`pointer-events-auto absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 flex items-center gap-1.5 rounded-full backdrop-blur-md border shadow-md px-3 py-1.5 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer group ${
                        isDealsOpen
                            ? 'bg-[#A97A36] text-white border-[#A97A36]'
                            : 'bg-white/95 text-zinc-800 border-[#A97A36]/40 hover:bg-[#A97A36] hover:text-white'
                    }`}
                >
                    <TrendingUp
                        className={`h-3.5 w-3.5 transition-colors ${
                            isDealsOpen ? 'text-white' : 'text-[#A97A36] group-hover:text-white'
                        }`}
                    />
                    <span>{TEXT.nadlanDeals}</span>
                    {isDealsOpen && <X className='h-3.5 w-3.5 ms-0.5' />}
                </button>
            )}

            {/* View Mode Toggle: Satellite (Realistic Hybrid) vs Streets (bottom-left) */}
            <div
                dir='rtl'
                className='pointer-events-auto absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 z-20 flex items-center rounded-full bg-white/95 backdrop-blur-md border border-[#A97A36]/40 shadow-md p-0.5 text-[11px] sm:text-xs'
            >
                <button
                    type='button'
                    onClick={() => switchBackground(BG_MODES.HYBRID)}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all cursor-pointer select-none ${
                        bgMode === BG_MODES.HYBRID
                            ? 'bg-[#A97A36] text-white font-bold shadow-xs'
                            : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 font-medium'
                    }`}
                    title={TEXT.satelliteTooltip}
                >
                    <Satellite className='h-3.5 w-3.5' />
                    <span>{TEXT.satelliteView}</span>
                </button>
                <button
                    type='button'
                    onClick={() => switchBackground(BG_MODES.STREETS)}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all cursor-pointer select-none ${
                        bgMode === BG_MODES.STREETS
                            ? 'bg-[#A97A36] text-white font-bold shadow-xs'
                            : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 font-medium'
                    }`}
                    title={TEXT.streetsTooltip}
                >
                    <MapIcon className='h-3.5 w-3.5' />
                    <span>{TEXT.streetsView}</span>
                </button>
            </div>

            {/* Marker-anchored popup (expanded card or collapsed badge) */}
            {status === 'found' && markerPixel && isMarkerVisible && (
                isCardOpen ? (
                    <div
                        dir='rtl'
                        style={{
                            left: `${clampedX}px`,
                            top: isAbove ? `${markerPixel.y - 38}px` : `${markerPixel.y + 12}px`,
                            transform: isAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
                        }}
                        className='pointer-events-auto absolute z-20 w-60 sm:w-68 max-w-[85vw] rounded-xl bg-white/95 backdrop-blur-md border border-[#A97A36]/30 shadow-xl p-3 text-zinc-800 animate-in fade-in zoom-in-95 duration-200 will-change-transform'
                    >
                        {/* Header: Pin + Title/Address + Minimize button */}
                        <div className='flex items-start gap-2'>
                            <span className='mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A97A36] text-white shadow-xs'>
                                <MapPin className='h-3.5 w-3.5' />
                            </span>
                            <div className='min-w-0 flex-1'>
                                {title && <h4 className='text-xs font-bold truncate text-zinc-900'>{title}</h4>}
                                <p className='text-[11px] text-zinc-600 leading-snug line-clamp-2'>{address}</p>
                            </div>
                            <button
                                type='button'
                                onClick={() => setIsCardOpen(false)}
                                title='מזער'
                                aria-label='מזער'
                                className='shrink-0 rounded-md p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer'
                            >
                                <X className='h-3.5 w-3.5' />
                            </button>
                        </div>

                        {/* Details (Gush/Helka & Nearby Amenities) */}
                        {details && (
                            <div className='mt-2.5 space-y-2 border-t border-zinc-100 pt-2'>
                                {details.gush != null && (
                                    <div className='flex items-center gap-1.5 text-[11px] text-zinc-700'>
                                        <Landmark className='h-3.5 w-3.5 text-[#A97A36] shrink-0' />
                                        <span>
                                            {TEXT.gush} <b>{details.gush}</b>
                                            {details.helka != null && (
                                                <>
                                                    {' '}· {TEXT.helka} <b>{details.helka}</b>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                )}
                                {nearbyItems.length > 0 && (
                                    <>
                                        <div className='grid grid-cols-3 gap-1.5'>
                                            {nearbyItems.map(({ icon: Icon, label, value }) => (
                                                <div
                                                    key={label}
                                                    className='flex flex-col items-center rounded-lg bg-[#A97A36]/10 px-1 py-1.5 transition-colors hover:bg-[#A97A36]/20'
                                                >
                                                    <Icon className='h-3.5 w-3.5 text-[#A97A36]' />
                                                    <span className='text-xs font-bold leading-none mt-1 text-zinc-900'>{value}</span>
                                                    <span className='text-[9px] text-zinc-600 mt-0.5 text-center leading-tight'>{label}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className='text-[9px] text-zinc-400 text-center'>{TEXT.within}</p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Pointer arrow pointing directly at the pin marker */}
                        {isAbove ? (
                            <div
                                style={{ left: `calc(50% + ${clampedArrowOffset}px)` }}
                                className='absolute -bottom-2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.12)] pointer-events-none'
                            />
                        ) : (
                            <div
                                style={{ left: `calc(50% + ${clampedArrowOffset}px)` }}
                                className='absolute -top-2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white drop-shadow-[0_-2px_2px_rgba(0,0,0,0.12)] pointer-events-none'
                            />
                        )}
                    </div>
                ) : (
                    /* Minimized clickable pin badge */
                    <button
                        type='button'
                        dir='rtl'
                        onClick={() => setIsCardOpen(true)}
                        style={{
                            left: `${clampedX}px`,
                            top: isAbove ? `${markerPixel.y - 38}px` : `${markerPixel.y + 12}px`,
                            transform: isAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
                        }}
                        className='pointer-events-auto absolute z-20 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#A97A36]/40 shadow-lg px-3 py-1.5 text-xs text-zinc-800 hover:bg-[#A97A36]/10 transition-all cursor-pointer animate-in fade-in duration-150 will-change-transform'
                    >
                        <MapPin className='h-3.5 w-3.5 text-[#A97A36]' />
                        <span className='font-bold truncate max-w-40'>{title || address}</span>
                        <ChevronDown className='h-3 w-3 text-zinc-500' />
                    </button>
                )
            )}
        </section>
    );
};

export default MapComponent;
