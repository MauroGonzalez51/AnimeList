import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { isPlainObject } from "es-toolkit";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function moveItem<T>(
    items: readonly T[],
    index: number,
    direction: -1 | 1,
): T[] {
    const target = index + direction;
    const next = [...items];
    const current = next[index];
    const neighbor = next[target];
    if (current === undefined || neighbor === undefined) {
        return next;
    }

    next[index] = neighbor;
    next[target] = current;
    return next;
}

export function blankToUndefined<T>(value: T): T | undefined {
    if (value === "" || value === false) {
        return undefined;
    }

    if (typeof value === "number" && Number.isNaN(value)) {
        return undefined;
    }

    return value;
}

export function prune<T>(value: T): T {
    if (Array.isArray(value)) {
        return value.map((item) => prune(item)) as T;
    }

    if (!isPlainObject(value)) {
        return value;
    }

    const entries = Object.entries(value)
        .map(([key, item]) => [key, prune(item)] as const)
        .filter(
            ([, item]) =>
                item !== undefined &&
                !(isPlainObject(item) && Object.keys(item).length === 0),
        );

    return Object.fromEntries(entries) as T;
}

export function parseNumber(value: string): string | number {
    if (value.trim() === "") {
        return value;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return value;
    }

    return parsed;
}
