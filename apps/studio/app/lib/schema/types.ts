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

export interface EntryNode {
    entry: FlatEntry;
    children: EntryNode[];
    related: EntryNode[];
}

export type EntryDraft = DistributedOmit<
    FlatEntry,
    "id" | "references" | "_parentId" | "_isGeneratedId" | "_source" | "style"
>;
