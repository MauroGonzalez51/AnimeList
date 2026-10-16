import type { Entry } from "@animelist/packages-schema";
import type { DistributedOmit, DistributedPick } from "type-fest";
import type { CSSProperties } from "vue";

export type SourceType = keyof DistributedPick<Entry, "related" | "children">;

export type FlatEntry = DistributedOmit<Entry, "children" | "related"> & {
    id: string;
    _parentId?: string;
    _isGeneratedId?: boolean;
    _source?: SourceType;
    style?: CSSProperties;
};
