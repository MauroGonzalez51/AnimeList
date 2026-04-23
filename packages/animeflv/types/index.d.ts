import type { ArgumentsCamelCase } from "yargs";

declare global {
    namespace CLI {
        interface GlobalParameters {
            verbose: boolean;
        }

        namespace Commands {
            namespace Export {
                interface Parameters {
                    output: string;
                }
            }
        }

        type ResolveParameters<T extends object> = ArgumentsCamelCase<
            Partial<CLI.GlobalParameters> & T
        >;
    }
}

export {};
