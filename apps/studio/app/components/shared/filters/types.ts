import type { z } from "zod";

export interface FilterField<TItem, TSchema extends z.ZodType = z.ZodType> {
    schema: TSchema;
    initialValue?: z.output<TSchema>;
    predicate?: (args: { item: TItem; value: z.output<TSchema> }) => boolean;
    active?:
        | boolean
        | ((args: { item: TItem; value: z.output<TSchema> }) => boolean);
    sync?: boolean;
}

export type FilterFields<TItem, TShape extends Record<string, z.ZodType>> = {
    [K in keyof TShape]: FilterField<TItem, TShape[K]>;
};

export type FilterValues<TShape extends Record<string, z.ZodType>> = {
    [K in keyof TShape]: z.output<TShape[K]>;
};
