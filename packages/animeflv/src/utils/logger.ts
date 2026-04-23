import { createConsola } from "consola";
import { Singleton } from "@/utils/decorators";

export class Logger {
    @Singleton()
    static getInstance(verbose: boolean = false) {
        if (verbose) {
            const logger = createConsola({
                level: 4,
            });

            return logger;
        }

        return createConsola({ level: 3 });
    }
}
