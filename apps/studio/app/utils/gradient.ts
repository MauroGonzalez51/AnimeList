import type { CSSProperties } from "vue";
import memoize from "memoize";
import QuickLRU from "quick-lru";

export interface OklchColor {
    l: number;
    c: number;
    h: number;
}

export interface GradientOptions {
    angle?: number;
    lightness?: number;
    chroma?: number;
}

const DEFAULT_HUE = 220;

function hashHue(value: string): number {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) % 360;
}

const toCss = ({ l, c, h }: OklchColor) => `oklch(${l} ${c} ${h})`;

function gradientStops(
    values: readonly string[],
    { lightness = 0.72, chroma = 0.14 }: GradientOptions = {},
): OklchColor[] {
    const hues = values.map(hashHue);

    if (hues.length === 0) {
        hues.push(DEFAULT_HUE);
    }

    if (hues.length === 1) {
        hues.push((hues[0]! + 40) % 360);
    }

    return hues.map((h) => ({ l: lightness, c: chroma, h }));
}

function _getGradient(
    values: readonly string[],
    { angle = 135, ...colorOptions }: GradientOptions = {},
): CSSProperties {
    const stops = gradientStops(values, colorOptions);

    return {
        ...Object.fromEntries(
            stops.map((stop, i) => [`--stop-${i}`, toCss(stop)]),
        ),
        backgroundImage: `linear-gradient(${angle}deg, ${stops
            .map((_, i) => `var(--stop-${i})`)
            .join(", ")})`,
    };
}

export const getGradient = memoize(_getGradient, {
    cacheKey([values, options]) {
        const { angle = 135, lightness = 0.72, chroma = 0.14 } = options ?? {};
        return `${values.join("|")}::${angle}:${lightness}:${chroma}`;
    },
    cache: new QuickLRU({ maxSize: 200 }),
});
