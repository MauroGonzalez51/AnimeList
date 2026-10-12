import type { z } from "zod";
import { invoke } from "@tauri-apps/api/core";

interface CommandDef {
    input?: z.ZodType;
    result: z.ZodType;
}
type CommandDefs = Record<string, CommandDef>;

type InputOf<D extends CommandDef> = D extends {
    input: infer I extends z.ZodType;
}
    ? z.input<I>
    : void;
type ResultOf<D extends CommandDef> = z.output<D["result"]>;

export type CommandMap<T extends CommandDefs> = {
    [K in keyof T]: { input: InputOf<T[K]>; result: ResultOf<T[K]> };
};

export function defineCommands<const T extends CommandDefs>(defs: T) {
    async function call<K extends keyof T & string>(
        name: K,
        ...args: InputOf<T[K]> extends void ? [] : [input: InputOf<T[K]>]
    ): Promise<ResultOf<T[K]>> {
        const definition: CommandDef = defs[name]!;

        if (definition.input) {
            const payload = definition.input.parse(args[0]) as Record<
                string,
                unknown
            >;
            const raw = await invoke(name, payload);
            return definition.result.parse(raw) as ResultOf<T[K]>;
        }

        const raw = await invoke(name);
        return definition.result.parse(raw) as ResultOf<T[K]>;
    }

    return { defs, call };
}
