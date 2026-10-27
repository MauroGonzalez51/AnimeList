import { get, set } from "es-toolkit/compat";
import { z } from "zod";

type Path = string[];

function unwrap(schema: z.ZodType): z.ZodType {
    if (
        schema instanceof z.ZodOptional ||
        schema instanceof z.ZodNullable ||
        schema instanceof z.ZodDefault
    ) {
        return unwrap(schema.unwrap() as z.ZodType);
    }

    return schema;
}

function leafPaths(schema: z.ZodType, path: Path = []): Path[] {
    const inner = unwrap(schema);

    if (inner instanceof z.ZodObject) {
        return Object.entries(inner.shape).flatMap(([key, value]) =>
            leafPaths(value as z.ZodType, [...path, key]),
        );
    }

    if (inner instanceof z.ZodRecord && inner.keyType instanceof z.ZodEnum) {
        return inner.keyType.options.flatMap((key) =>
            leafPaths(inner.valueType as z.ZodType, [...path, String(key)]),
        );
    }

    return [path];
}

export function isObjectSchema(schema: z.ZodType) {
    return unwrap(schema) instanceof z.ZodObject;
}

export function useFlatQuery(key: string, schema: z.ZodType) {
    const leaves = leafPaths(schema).map((path) => ({
        path,
        query: useRouteQuery([key, ...path].join(".")),
    }));

    return computed({
        get() {
            let result: Record<string, unknown> | undefined;

            for (const { path, query } of leaves) {
                if (query.value === null || query.value === undefined) {
                    continue;
                }

                result ??= {};
                set(result, path, query.value);
            }

            return result;
        },
        set(value: unknown) {
            for (const { path, query } of leaves) {
                query.value = get(value, path) ?? undefined;
            }
        },
    }) as Ref<unknown>;
}

export function useFieldQuery(key: string, schema: z.ZodType) {
    if (isObjectSchema(schema)) {
        return useFlatQuery(key, schema);
    }

    return useRouteQuery(key);
}
