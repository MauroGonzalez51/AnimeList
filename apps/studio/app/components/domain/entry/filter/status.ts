import type {
    AdaptedUntil,
    BaseStatus,
    ReadableStatus,
    WatchableStatus,
} from "@animelist/packages-schema";
import type { ConditionalKeys } from "type-fest";
import type { ZodType } from "zod";
import type { FlatEntry } from "@/lib/schema/types";
import {
    BaseStatusSchema,
    ReadableEntryExtrasSchema,
    ReadableStatusSchema,
    WatchableStatusSchema,
} from "@animelist/packages-schema";
import { snakeCase } from "es-toolkit";
import { z } from "zod";

type StatusShape = BaseStatus &
    WatchableStatus &
    ReadableStatus & { adaptedUntil?: AdaptedUntil };
type StatusKey = keyof StatusShape;

export type RangeKey = ConditionalKeys<
    StatusShape,
    string | number | undefined
>;
export type OptionKey = Exclude<StatusKey, RangeKey>;

export const OptionValueSchema = z.enum(["yes", "no"]);
export const RangeSchema = z.object({
    min: z.coerce.number().optional(),
    max: z.coerce.number().optional(),
});

export type OptionValue = z.infer<typeof OptionValueSchema>;
export type OptionChoice = OptionValue | "any";
export type Range = z.infer<typeof RangeSchema>;
export type Bound = keyof Range;

interface OptionField {
    type: "option";
    key: OptionKey;
    label: string;
}

interface RangeField {
    type: "range";
    key: RangeKey;
    label: string;
}

type StatusField = OptionField | RangeField;

interface StatusGroup {
    key: "base" | "watchable" | "readable";
    label: string;
    fields: StatusField[];
}

export interface StatusChip {
    key: StatusField["key"];
    label: string;
    keypath: string;
    min?: number;
    max?: number;
}

function fieldLabel(key: StatusKey) {
    return `domain.entry.filter.status.fields.${snakeCase(key)}`;
}

function toField(key: StatusKey, schema: ZodType): StatusField {
    if (schema.safeParse(1).success) {
        return { type: "range", key: key as RangeKey, label: fieldLabel(key) };
    }

    return { type: "option", key: key as OptionKey, label: fieldLabel(key) };
}

function fieldsOf(shape: Record<string, ZodType>, skip: string[] = []) {
    return Object.keys(shape)
        .filter((key) => !skip.includes(key))
        .map((key) => toField(key as StatusKey, shape[key]!));
}

const BASE_KEYS = Object.keys(BaseStatusSchema.shape);

export const STATUS_GROUPS: StatusGroup[] = [
    {
        key: "base",
        label: "domain.entry.filter.status.groups.base",
        fields: fieldsOf(BaseStatusSchema.shape),
    },
    {
        key: "watchable",
        label: "domain.entry.filter.status.groups.watchable",
        fields: fieldsOf(WatchableStatusSchema.shape, BASE_KEYS),
    },
    {
        key: "readable",
        label: "domain.entry.filter.status.groups.readable",
        fields: [
            ...fieldsOf(ReadableStatusSchema.shape, BASE_KEYS),
            ...fieldsOf(ReadableEntryExtrasSchema.shape),
        ],
    },
];

export const STATUS_FIELDS = STATUS_GROUPS.flatMap((group) => group.fields);

const OPTION_KEYS = STATUS_FIELDS.filter(
    (field) => field.type === "option",
).map((field) => field.key) as [OptionKey, ...OptionKey[]];

const RANGE_KEYS = STATUS_FIELDS.filter((field) => field.type === "range").map(
    (field) => field.key,
) as [RangeKey, ...RangeKey[]];

export const StatusFilterSchema = z.object({
    options: z.partialRecord(z.enum(OPTION_KEYS), OptionValueSchema).optional(),
    ranges: z.partialRecord(z.enum(RANGE_KEYS), RangeSchema).optional(),
});

export type StatusFilter = z.infer<typeof StatusFilterSchema>;

export const OPTION_CHOICES: { value: OptionChoice; label: string }[] = [
    { value: "any", label: `domain.entry.filter.status.options.any` },
    { value: "yes", label: `domain.entry.filter.status.options.yes` },
    { value: "no", label: `domain.entry.filter.status.options.no` },
];

export function emptyStatusFilter(): StatusFilter {
    return {};
}

export function setOption(
    state: StatusFilter,
    key: OptionKey,
    value: OptionChoice,
): StatusFilter {
    const { [key]: _removed, ...options } = state.options ?? {};

    if (value === "any") {
        return { ...state, options };
    }

    return { ...state, options: { ...options, [key]: value } };
}

export function setRange(
    state: StatusFilter,
    key: RangeKey,
    bound: Bound,
    value: unknown,
): StatusFilter {
    const range = { ...state.ranges?.[key], [bound]: parseBound(value) };

    return { ...state, ranges: { ...state.ranges, [key]: range } };
}

export function clearStatusField(
    state: StatusFilter,
    key: StatusField["key"],
): StatusFilter {
    const { [key as OptionKey]: _option, ...options } = state.options ?? {};
    const { [key as RangeKey]: _range, ...ranges } = state.ranges ?? {};

    return { options, ranges };
}

export function getStatusChips(state: StatusFilter): StatusChip[] {
    const chips: StatusChip[] = [];

    for (const field of STATUS_FIELDS) {
        const chip = buildChip(state, field);
        if (chip) {
            chips.push(chip);
        }
    }

    return chips;
}

export function matchesStatus(item: FlatEntry, state: StatusFilter) {
    for (const field of STATUS_FIELDS) {
        const raw = readField(item, field.key);

        if (field.type === "option" && !matchesOption(raw, state, field.key)) {
            return false;
        }

        if (field.type === "range" && !matchesRange(raw, state, field.key)) {
            return false;
        }
    }

    return true;
}

function parseBound(value: unknown) {
    if (value === "" || value === undefined || value === null) {
        return undefined;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return undefined;
    }

    return parsed;
}

function buildChip(
    state: StatusFilter,
    field: StatusField,
): StatusChip | undefined {
    if (field.type === "option") {
        return optionChip(field, state.options?.[field.key]);
    }

    return rangeChip(field, state.ranges?.[field.key]);
}

function optionChip(field: OptionField, value: OptionValue | undefined) {
    if (!value) {
        return;
    }

    return {
        key: field.key,
        label: field.label,
        keypath: `domain.entry.filter.status.chip.${value}`,
    };
}

function rangeChip(field: RangeField, range: Range | undefined) {
    const { min, max } = range ?? {};

    if (min === undefined && max === undefined) {
        return;
    }

    return {
        key: field.key,
        label: field.label,
        keypath: `domain.entry.filter.status.chip.${rangeChipKind(min, max)}`,
        min,
        max,
    };
}

function rangeChipKind(min: number | undefined, max: number | undefined) {
    if (min !== undefined && max !== undefined) {
        return "between";
    }

    if (min !== undefined) {
        return "min";
    }

    return "max";
}

function readField(item: FlatEntry, key: StatusField["key"]): unknown {
    if (key === "adaptedUntil") {
        return (item as { adaptedUntil?: unknown }).adaptedUntil;
    }

    const status = (item as { status?: Record<string, unknown> }).status;

    return status?.[key];
}

function hasValue(value: unknown) {
    if (typeof value === "string" || Array.isArray(value)) {
        return value.length > 0;
    }

    if (typeof value === "object" && value !== null) {
        return Object.keys(value).length > 0;
    }

    return Boolean(value);
}

function matchesOption(raw: unknown, state: StatusFilter, key: OptionKey) {
    const choice = state.options?.[key];
    if (!choice) {
        return true;
    }

    return hasValue(raw) === (choice === "yes");
}

function matchesRange(raw: unknown, state: StatusFilter, key: RangeKey) {
    const { min, max } = state.ranges?.[key] ?? {};
    if (min === undefined && max === undefined) {
        return true;
    }

    const value = parseBound(raw);
    if (value === undefined) {
        return false;
    }

    return value >= (min ?? -Infinity) && value <= (max ?? Infinity);
}
