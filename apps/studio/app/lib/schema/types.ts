import type { Entry } from "@animelist/packages-schema";
import type { DistributedOmit } from "type-fest";
import type { CSSProperties } from "vue";

export type FlatEntry = DistributedOmit<Entry, "children" | "related"> & {
    id: string;
    _parentId?: string;
    _isGeneratedId?: boolean;
    style?: CSSProperties;
};
