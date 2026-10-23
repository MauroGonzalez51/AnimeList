import type { z } from "zod";

export interface FieldDefinition<TData, TSchema extends z.ZodType = z.ZodType> {
    schema: TSchema;
    initialValue?: z.output<TSchema>;
    predicate?: (args: { item: TData; value: z.output<TSchema> }) => boolean;
    sync?: boolean;
}

export type FieldDefinitions<
    TData,
    Schemas extends Record<string, z.ZodType>,
> = {
    [K in keyof Schemas]: FieldDefinition<TData, Schemas[K]>;
};

export type FieldsData<Schemas extends Record<string, z.ZodType>> = {
    [K in keyof Schemas]: z.output<Schemas[K]>;
};
