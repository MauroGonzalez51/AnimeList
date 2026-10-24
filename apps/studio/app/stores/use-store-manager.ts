import type { Meta } from "@animelist/packages-schema";
import type { DistributedOmit, Get, Paths } from "type-fest";
import type { EntryDraft, FlatEntry, SourceType } from "@/lib/schema";
import { set } from "es-toolkit/compat";
import {
    entryIdFromParts,
    flattenEntries,
    newGeneratedId,
    performWrite,
    pickStoreFile,
    readStoreContent,
} from "@/lib/schema";

type PatchedFlatEntry = DistributedOmit<
    FlatEntry,
    "id" | "_isGeneratedId" | "_source" | "style"
>;

export const useStoreManager = defineStore(NuxtKeys.Stores.StoreManager, () => {
    const { $logger } = useNuxtApp();
    const config = useConfig();

    const meta = ref<Meta | undefined>(undefined);
    const entries = ref<FlatEntry[] | undefined>(undefined);
    const entriesMap = shallowReactive<Map<FlatEntry["id"], FlatEntry>>(
        new Map<string, FlatEntry>(),
    );

    async function process(path: string) {
        const data = (await readStoreContent(path, { logger: $logger })).match(
            (content) => content,
            (error) => {
                $logger.error(error);
                return null;
            },
        );

        if (!data || !data.entries) {
            return null;
        }

        return {
            meta: data.meta,
            entries: flattenEntries(data.entries, { style: true }),
        };
    }

    async function reload() {
        const path = config.state.value?.store_path;
        if (!path) {
            return;
        }

        const data = await process(path);
        if (data) {
            meta.value = data.meta;
            entries.value = data.entries;
        }
    }

    async function pick() {
        const path = await pickStoreFile();
        if (!path) {
            return;
        }

        config.dispatch.patch("store_path", path);
    }

    async function clear() {
        if (config.state.value?.store_path) {
            config.dispatch.patch("store_path", null);
        }
    }

    async function patchEntry<
        Path extends Paths<PatchedFlatEntry>,
        Value extends Get<PatchedFlatEntry, Path>,
    >(id: FlatEntry["id"], path: Path, value: Value) {
        const entry = entriesMap.get(id);
        if (!entry) {
            return;
        }

        set(entry, path, value);
        persist();
    }

    function persist() {
        if (config.state.value?.store_path && meta.value) {
            performWrite({
                path: config.state.value.store_path,
                schemaPath: config.state.value.store_schema_path,
                data: { meta: meta.value, entries: entriesMap },
            });
        }
    }

    function replaceEntries(next: FlatEntry[]) {
        entries.value = next;
        entriesMap.clear();
        for (const entry of next) {
            entriesMap.set(entry.id, entry);
        }
    }

    function moveEntry(id: FlatEntry["id"], direction: -1 | 1) {
        const list = [...entriesMap.values()];
        const index = list.findIndex((entry) => entry.id === id);
        const current = list[index];
        if (!current) {
            return;
        }

        const isSibling = (entry: FlatEntry) =>
            entry._parentId === current._parentId &&
            entry._source === current._source;

        let target = index + direction;
        while (list[target] && !isSibling(list[target]!)) {
            target += direction;
        }

        const neighbor = list[target];
        if (!neighbor) {
            return;
        }

        list[index] = neighbor;
        list[target] = current;

        replaceEntries(list);
        persist();
    }

    function updateEntry(id: FlatEntry["id"], draft: EntryDraft) {
        const current = entriesMap.get(id);
        if (!current) {
            return;
        }

        const next: FlatEntry = {
            ...draft,
            id,
            references: current.references,
            _parentId: current._parentId,
            _source: current._source,
            _isGeneratedId: current._isGeneratedId,
            style: current.style,
        };

        const list = [...entriesMap.values()];
        list[list.findIndex((entry) => entry.id === id)] = next;

        replaceEntries(list);
        persist();
    }

    function ensureStableId(id: FlatEntry["id"]) {
        const entry = entriesMap.get(id);
        if (!entry?._isGeneratedId) {
            return id;
        }

        const base = entryIdFromParts(entry);
        let next = base;
        let suffix = 2;
        while (entriesMap.has(next)) {
            next = `${base}-${suffix}`;
            suffix++;
        }

        const list = [...entriesMap.values()];
        for (const item of list) {
            if (item._parentId === id) {
                item._parentId = next;
            }

            for (const reference of item.references ?? []) {
                if (reference.id === id) {
                    reference.id = next;
                }
            }
        }

        entry.id = next;
        delete entry._isGeneratedId;

        replaceEntries(list);
        persist();

        return next;
    }

    function ensureStyle(id: FlatEntry["id"]) {
        const entry = entriesMap.get(id);
        if (!entry || entry.style) {
            return;
        }

        entry.style = getGradient([id]);
    }

    function addEntry(
        draft: EntryDraft,
        parent?: { id: FlatEntry["id"]; source: SourceType },
    ) {
        const id = newGeneratedId();
        const entry: FlatEntry = { ...draft, id, _isGeneratedId: true };

        if (parent) {
            entry._parentId = parent.id;
            entry._source = parent.source;
        } else {
            entry.style = getGradient([id]);
        }

        replaceEntries([...entriesMap.values(), entry]);
        persist();

        return id;
    }

    watch(
        entries,
        (newEntries) => {
            entriesMap.clear();

            if (!newEntries) {
                return;
            }

            for (let i = 0; i < newEntries.length; i++) {
                const entry = newEntries[i];

                if (!entry) {
                    continue;
                }

                entriesMap.set(entry.id, entry);
            }
        },
        { immediate: true },
    );

    return {
        meta,
        entries,
        entriesMap,
        dispatch: {
            pick,
            clear,
            reload,
            process,
            patchEntry,
            moveEntry,
            addEntry,
            updateEntry,
            ensureStableId,
            ensureStyle,
        },
    };
});
