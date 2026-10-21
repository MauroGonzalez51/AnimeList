import type { ComputedRef, InjectionKey } from "vue";
import type { ZodType } from "zod";

export interface FiltersContext {
    keys: ComputedRef<string[]>;
    state: ComputedRef<Record<string, unknown>>;
    fields: ComputedRef<Record<string, ZodType>>;
    set: (key: string, value: unknown) => void;
    reset: (key?: string) => void;
}

export interface FilterFieldProps {
    modelValue: unknown;
    "onUpdate:modelValue": (value: unknown) => void;
    reset: () => void;
    isActive: boolean;
    schema: ZodType;
}

export const FILTERS_CONTEXT: InjectionKey<FiltersContext> =
    Symbol("filters-context");
