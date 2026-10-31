<script setup lang="ts">
    import type { FlatEntry, SourceType } from "~/lib/schema";

    definePageMeta({
        layout: "sidebar",
    });

    const migrator = useMigrator();
    const store = useMigratorStore();

    const sourceQuery = useRouteQuery("source", "", {
        transform(value) {
            return String(value ?? "");
        },
    });

    const current = computed(
        () => migrator.dispatch.searchSource(sourceQuery.value)[0],
    );

    const target = ref<FlatEntry | undefined>(undefined);

    const hints = computed(() => {
        const record = current.value?.record;
        if (!record) {
            return undefined;
        }

        const label = record.label ?? record.name ?? record.title;
        if (typeof label !== "string") {
            return undefined;
        }

        return { name: label };
    });

    const reveal = useRevealAnimations();

    function create() {
        store.dispatch.create(hints.value);
    }

    function attach(source: SourceType) {
        if (!target.value) {
            return;
        }

        store.dispatch.attach(target.value.id, source, hints.value);
    }

    function edit() {
        if (!target.value) {
            return;
        }

        store.dispatch.edit(target.value);
    }
</script>

<template>
    <section class="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4">
        <DropZoneArea
            v-if="!migrator.hasSource.value"
            @click="migrator.dispatch.load"
        />

        <Transition
            :css="false"
            @enter="reveal.onEnter"
            @leave="reveal.onLeave"
        >
            <div
                v-if="migrator.hasSource.value"
                class="grid items-start gap-6 md:grid-cols-2"
            >
                <MigratorSourceCard
                    v-model:query="sourceQuery"
                    :migrator="migrator"
                />

                <MigratorStoreCard
                    v-model:target="target"
                    :store="store"
                    @create="create"
                    @attach="attach"
                    @edit="edit"
                />
            </div>
        </Transition>
    </section>
</template>
