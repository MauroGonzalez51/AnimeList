<script setup lang="ts">
    import type { HTMLAttributes } from "vue";
    import type { EntryNode, FlatEntry, SourceType } from "~/lib/schema";
    import { KIND_LABELS } from "~/lib/store";
    import { cn } from "~/lib/utils";

    interface Props {
        title: string;
        nodes: EntryNode[];
        parentId: FlatEntry["id"];
        source: SourceType;
        class?: HTMLAttributes["class"];
    }

    const props = defineProps<Props>();

    const manager = useStoreManager();
    const entryForm = useEntryForm();
</script>

<template>
    <Card :class="cn(props.class)">
        <CardHeader>
            <CardTitle class="text-sm">{{ title }}</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-1">
            <EntrySortableRow
                v-for="(node, index) in nodes"
                :key="node.entry.id"
                :index="index"
                :count="nodes.length"
                editable
                @edit="entryForm.edit(node.entry)"
                @move="
                    (direction) =>
                        manager.dispatch.moveEntry(node.entry.id, direction)
                "
            >
                <NuxtLink
                    :to="
                        $localeRoute({
                            name: 'entry-id',
                            params: { id: node.entry.id },
                        })
                    "
                    class="flex min-w-0 flex-1 items-center justify-between gap-3"
                >
                    <span class="flex min-w-0 flex-col">
                        <span class="truncate text-sm font-medium">
                            {{ node.entry.name }}
                        </span>
                        <span
                            v-if="node.entry.chronology"
                            class="truncate text-xs text-muted-foreground"
                        >
                            {{ node.entry.chronology }}
                        </span>
                    </span>
                    <Badge variant="outline" class="shrink-0 font-normal">
                        <TranslatedMessage
                            :keypath="KIND_LABELS[node.entry.kind]"
                        />
                    </Badge>
                </NuxtLink>
            </EntrySortableRow>

            <Button
                type="button"
                variant="ghost"
                class="mt-1 cursor-pointer justify-start text-muted-foreground"
                @click="entryForm.create({ id: parentId, source })"
            >
                <LucidePlus data-icon="inline-start" />
                {{ $t("views.entry.id.actions.add") }}
            </Button>
        </CardContent>
    </Card>
</template>
