import type { ArgumentsCamelCase } from "yargs";
import type { OutputFormat } from "@/core/constants";

declare global {
    namespace CLI {
        interface GlobalParameters {
            verbose?: boolean;
        }

        namespace Commands {
            namespace Export {
                interface Parameters {
                    output: string;
                }
            }

            namespace Scrape {
                interface Parameters {
                    input: string;
                    output: string;
                }
            }

            interface BrowserOptions {
                browser?: string;
                headless: boolean;
            }

            interface OutputOptions {
                output: string;
                format: OutputFormat;
            }
        }

        type ResolveParameters<T extends object> = ArgumentsCamelCase<
            Partial<CLI.GlobalParameters> & T
        >;
    }
}
