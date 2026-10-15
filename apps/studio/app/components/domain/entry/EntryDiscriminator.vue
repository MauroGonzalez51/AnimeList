<script setup lang="ts" generic="T extends Entry | FlatEntry">
    import type {
        Entry,
        ReadableKind,
        WatchableKind,
    } from "@animelist/packages-schema";
    import type { FlatEntry } from "@/lib/schema";
    import { _isReadable, _isUniverse, _isWatchable } from "@/lib/store";

    interface Props {
        entry: T;
    }

    interface Slots {
        universe?: (props: {
            universe: Extract<T, { kind: "universe" }>;
        }) => VNode[];
        readable?: (props: {
            readable: Extract<T, { kind: ReadableKind }>;
        }) => VNode[];
        watchable?: (props: {
            watchable: Extract<T, { kind: WatchableKind }>;
        }) => VNode[];
    }

    defineProps<Props>();
    defineSlots<Slots>();
</script>

<template>
    <template v-if="_isUniverse(entry)">
        <slot name="universe" v-bind="{ universe: entry }" />
    </template>

    <template v-else-if="_isReadable(entry)">
        <slot name="readable" v-bind="{ readable: entry }" />
    </template>

    <template v-else-if="_isWatchable(entry)">
        <slot name="watchable" v-bind="{ watchable: entry }" />
    </template>
</template>
