import type { LucideIcon, LucideProps } from "@lucide/vue";
import type { FunctionalComponent } from "vue";

declare global {
    namespace Components {
        type LucideIconComponent =
            | LucideIcon
            | FunctionalComponent<LucideProps>;
    }
}
