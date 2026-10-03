import type { ConsolaInstance } from "consola";
import type { gsap } from "gsap";

declare module "#app" {
    interface NuxtApp {
        $logger: ConsolaInstance;
        $gsap: typeof gsap;
    }
}

declare module "vue" {
    interface ComponentCustomProperties {
        $logger: ConsolaInstance;
        $gsap: typeof gsap;
    }
}
