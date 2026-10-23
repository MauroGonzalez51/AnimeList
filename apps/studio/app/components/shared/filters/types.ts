import type { z } from "zod";

export interface FieldDefinition<TData, TSchema = unknown> {
    schema: z.ZodType<TSchema>;
    predicate?: (args: { item: TData; value: TSchema }) => boolean;
    sync?: boolean;
}

export type FieldsData<
    TData,
    R extends Record<string, FieldDefinition<TData>>,
> = {
    [K in keyof R]: z.output<R[K]["schema"]>;
};
