<script setup lang="ts">
    import type { FlatEntry } from "~/lib/schema";
    import type { EntryReference } from "~/lib/store";
    import { RELATION_LABELS } from "~/lib/store";
    import { moveItem } from "~/lib/utils";

    interface Props {
        entry: FlatEntry;
    }

    const props = defineProps<Props>();

    const manager = useStoreManager();
    const { entriesMap } = storeToRefs(manager);
    const modal = useModal();

    const references = computed(() =>
        (props.entry.references ?? []).map((reference) => ({
            ...reference,
            target: entriesMap.value.get(reference.id),
        })),
    );

    function candidatesFor(editingId?: string) {
        const referenced = new Set(references.value.map(({ id }) => id));

        return [...entriesMap.value.values()].filter(
            ({ id }) =>
                id !== props.entry.id &&
                (id === editingId || !referenced.has(id)),
        );
    }

    const { define: DefineReference, reuse: ReuseReference } =
        createReusableTemplate<(typeof references.value)[number]>();

    function move(index: number, direction: -1 | 1) {
        manager.dispatch.patchEntry(
            props.entry.id,
            "references",
            moveItem(props.entry.references ?? [], index, direction),
        );
    }

    function openDialog(options: {
        reference?: EntryReference;
        submit: (reference: EntryReference) => void;
    }) {
        modal.dispatch.loadComponent({
            key: "entry:reference",
            kind: "dialog",
            loader: () =>
                import("@/components/domain/entry/EntryReferenceDialog.vue"),
            props: {
                candidates: candidatesFor(options.reference?.id),
                ...options,
            },
        });
    }

    function openAdd() {
        openDialog({ submit: add });
    }

    function openEdit(index: number) {
        openDialog({
            reference: props.entry.references?.[index],
            submit: (reference) => replace(index, reference),
        });
    }

    function withStableId(reference: EntryReference): EntryReference {
        return { ...reference, id: manager.dispatch.ensureStableId(reference.id) };
    }

    function add(reference: EntryReference) {
        manager.dispatch.patchEntry(props.entry.id, "references", [
            ...(props.entry.references ?? []),
            withStableId(reference),
        ]);
    }

    function replace(index: number, reference: EntryReference) {
        manager.dispatch.patchEntry(
            props.entry.id,
            "references",
            (props.entry.references ?? []).toSpliced(
                index,
                1,
                withStableId(reference),
            ),
        );
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
                editable
                @edit="openEdit(index)"
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
