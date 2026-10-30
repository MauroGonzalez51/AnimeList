import type {
    InferredSchema,
    LoadedSource,
    MigratorStatus,
    SourceEntry,
    SourceRecord,
} from "~/lib/migrator";
import {
    enqueueSourceWrite,
    inferSchema,
    isArrayRoot,
    iterableKeys,
    loadSource,
    MIGRATOR_STATUS_KEY,
    pickSourceFile,
    processingSet,
    resolveCollection,
    toSourceEntries,
} from "~/lib/migrator";

export default function () {
    const { $logger } = useNuxtApp();

    const source = ref<LoadedSource | undefined>(undefined);
    const selectedKey = ref<string | undefined>(undefined);
    const schema = ref<InferredSchema | undefined>(undefined);

    // fast-access index into the resolved collection, keyed by position
    const index = shallowReactive<Map<SourceEntry["key"], SourceEntry>>(
        new Map<number, SourceEntry>(),
    );

    const hasSource = computed(() => Boolean(source.value));

    const isArray = computed(() => isArrayRoot(source.value?.root));

    // selectable "field to iterate" keys when the root is an object
    const keys = computed(() => {
        if (!source.value || isArray.value) {
            return [];
        }

        return iterableKeys(source.value.root);
    });

    // every entry in the selected collection, indexed for fast lookup
    const entries = computed<SourceEntry[]>(() => {
        if (!source.value) {
            return [];
        }

        const records = resolveCollection(source.value.root, selectedKey.value);
        return toSourceEntries(records);
    });

    // only entries still pending or without a status are presented for processing
    const pending = computed(() => processingSet(entries.value));

    watch(
        entries,
        (next) => {
            index.clear();
            for (const entry of next) {
                index.set(entry.key, entry);
            }

            // infer the shape from the first record so later records can be
            // validated against it (advisory, never blocking)
            const first = next[0]?.record;
            if (first) {
                schema.value = inferSchema(first);
                return;
            }

            schema.value = undefined;
        },
        { immediate: true },
    );

    async function load() {
        const path = await pickSourceFile();
        if (!path) {
            return;
        }

        const result = await loadSource(path, { logger: $logger });
        result.match(
            (loaded) => {
                source.value = loaded;
                selectedKey.value = undefined;
            },
            (error) => {
                $logger.error(error);
                source.value = undefined;
            },
        );

        return result.isOk();
    }

    function selectKey(key: string) {
        selectedKey.value = key;
    }

    function byKey(key: number) {
        return index.get(key);
    }

    // validate a record against the inferred shape; returns true when it drifts,
    // so the UI can warn without refusing to process the entry
    function drifts(record: SourceRecord) {
        if (!schema.value) {
            return false;
        }

        return !schema.value.runtime.safeParse(record).success;
    }

    // marking is the only interaction that writes the source file back
    function mark(key: number, status: MigratorStatus) {
        const entry = index.get(key);
        if (!entry || !source.value) {
            return;
        }

        entry.record[MIGRATOR_STATUS_KEY] = status;
        enqueueSourceWrite(source.value);
    }

    function resolve(key: number) {
        mark(key, "resolved");
    }

    function skip(key: number) {
        mark(key, "skipped");
    }

    // filter the pending entries by a query matched against their string values
    function searchSource(query: string): SourceEntry[] {
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) {
            return pending.value;
        }

        return pending.value.filter((entry) => {
            for (const value of Object.values(entry.record)) {
                if (
                    typeof value === "string" &&
                    value.toLowerCase().includes(trimmed)
                ) {
                    return true;
                }
            }

            return false;
        });
    }

    return {
        source,
        schema,
        hasSource,
        isArray,
        keys,
        selectedKey,
        entries,
        pending,
        dispatch: {
            load,
            selectKey,
            byKey,
            drifts,
            resolve,
            skip,
            searchSource,
        },
    };
}
