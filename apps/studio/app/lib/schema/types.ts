import type { Entry } from "@animelist/packages-schema";
import type { DistributedOmit, DistributedPick } from "type-fest";

export type SourceType = keyof DistributedPick<Entry, "related" | "children">;

export type FlatEntry = DistributedOmit<Entry, "children" | "related"> & {
    id: string;
    _parentId?: string;
    _isGeneratedId?: boolean;
    _source?: SourceType;
};

export interface EntryNode {
    entry: FlatEntry;
    children: EntryNode[];
    related: EntryNode[];
}

export type EntryDraft = DistributedOmit<
    FlatEntry,
    "id" | "references" | "_parentId" | "_isGeneratedId" | "_source"
>;
