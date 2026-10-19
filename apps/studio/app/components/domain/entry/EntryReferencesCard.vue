<script setup lang="ts">
    import type { FlatEntry } from "~/lib/schema";
    import { RELATION_LABELS } from "~/lib/store";
    import { moveItem } from "~/lib/utils";

    interface Props {
        entry: FlatEntry;
    }

    const props = defineProps<Props>();

    const manager = useStoreManager();
    const { entriesMap } = storeToRefs(manager);
    const modal = useModal();
    const entryForm = useEntryForm();

    const references = computed(() =>
        (props.entry.references ?? []).map((reference) => ({
            ...reference,
            target: entriesMap.value.get(reference.id),
        })),
    );

    const candidates = computed(() => {
        const referenced = new Set(references.value.map(({ id }) => id));

        return [...entriesMap.value.values()].filter(
            ({ id }) => id !== props.entry.id && !referenced.has(id),
        );
    });

    const { define: DefineReference, reuse: ReuseReference } =
        createReusableTemplate<(typeof references.value)[number]>();

    function move(index: number, direction: -1 | 1) {
        manager.dispatch.patchEntry(
            props.entry.id,
            "references",
            moveItem(props.entry.references ?? [], index, direction),
        );
    }

    function openAdd() {
        modal.dispatch.loadComponent({
            key: "entry:reference",
            kind: "dialog",
            loader: () =>
                import("@/components/domain/entry/EntryReferenceDialog.vue"),
            props: { candidates: candidates.value, submit: add },
        });
    }

    function add(reference: NonNullable<FlatEntry["references"]>[number]) {
        manager.dispatch.patchEntry(props.entry.id, "references", [
            ...(props.entry.references ?? []),
            reference,
        ]);
    }
</script>

<template>
    <DefineReference v-slot="{ id, target, relation }">
        <span class="truncate text-sm font-medium">{{ target?.name ?? id }}</span>
        <span class="flex shrink-0 gap-1">
            <Badge
                v-for="item in relation"
                :key="item"
                variant="outline"
                class="font-normal"
            >
                {{ $t(RELATION_LABELS[item]) }}
            </Badge>
        </span>
    </DefineReference>

    <Card>
        <CardHeader>
            <CardTitle class="text-sm">
                {{ $t("views.entry.id.sections.references") }}
            </CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-1">
            <EntrySortableRow
                v-for="(reference, index) in references"
                :key="reference.id"
                :index="index"
                :count="references.length"
                :editable="!!reference.target"
                @edit="reference.target && entryForm.edit(reference.target)"
                @move="(direction) => move(index, direction)"
            >
                <NuxtLink
                    v-if="reference.target"
                    :to="
                        $localeRoute({
                            name: 'entry-id',
                            params: { id: reference.id },
                        })
                    "
                    class="flex min-w-0 flex-1 items-center justify-between gap-3"
                >
                    <ReuseReference v-bind="reference" />
                </NuxtLink>

                <div
                    v-else
                    class="flex min-w-0 flex-1 items-center justify-between gap-3"
                >
                    <ReuseReference v-bind="reference" />
                </div>
            </EntrySortableRow>

            <Button
                type="button"
                variant="ghost"
                class="mt-1 cursor-pointer justify-start text-muted-foreground"
                @click="openAdd"
            >
                <LucidePlus data-icon="inline-start" />
                {{ $t("views.entry.id.actions.add") }}
            </Button>
        </CardContent>
    </Card>
</template>
