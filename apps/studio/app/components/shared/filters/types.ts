import type { ComputedRef, InjectionKey } from "vue";
import type { ZodType } from "zod";

export type FilterKey<TState extends object> = Extract<keyof TState, string>;

export interface FiltersContext<TState extends object, TKey extends FilterKey<TState>> {
    keys: ComputedRef<TKey[]>;
    state: ComputedRef<Partial<TState>>;
    fields: ComputedRef<Record<TKey, ZodType>>;
    set: <K extends TKey>(key: K, value: TState[K] | undefined) => void;
    reset: (key?: TKey) => void;
}

export interface FilterFieldProps<TValue = unknown> {
    modelValue: TValue | undefined;
    "onUpdate:modelValue": (value: TValue | undefined) => void;
    reset: () => void;
    isActive: boolean;
    schema: ZodType;
}

export const FILTERS_CONTEXT: InjectionKey<unknown> =
    Symbol("filters-context");
