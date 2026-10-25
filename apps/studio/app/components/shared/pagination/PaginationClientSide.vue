<script setup lang="ts" generic="TData">
    import type { PrimitiveProps } from "reka-ui";
    import type { HTMLAttributes, VNode } from "vue";
    import { promiseTimeout } from "@vueuse/core";
    import { Primitive } from "reka-ui";
    import { Temporal } from "temporal-polyfill";
    import { usePaginationControls } from "@/components/shared/pagination/injection-state";
    import { cn } from "@/lib/utils";

    type LoadingMethod = "single" | "multiple";

    interface Props {
        items: MaybeRefOrGetter<TData[] | undefined>;
        index: keyof TData;
        pageSize: number;
        class?: HTMLAttributes["class"];
        containerAs?: PrimitiveProps["as"];
        loadingTime?: number;
        loading?: boolean;
        loadingMethod?: LoadingMethod;
        condition?: (item: TData) => boolean | undefined;
    }

    interface Slots {
        empty: () => VNode[];
        "loading-container": () => VNode[];
        loading: () => VNode[];
        item: (props: TData & { $item: TData; $index: number }) => VNode[];
    }

    const props = withDefaults(defineProps<Props>(), {
        containerAs: "div",
        loadingTime: 500,
        loadingMethod: "multiple",
        loading: false,
    });
    defineSlots<Slots>();

    const page = defineModel<number>("page", { required: false, default: 1 });

    const containerRef = useTemplateRef("container");

    const loadingTimestamp = useState<Temporal.Instant | null>(
        NuxtKeys.Components.Pagination.ClientSide.Loading,
        () => null,
    );
    const loading = computed(
        () => loadingTimestamp.value !== null || props.loading,
    );

    const { items } = usePaginationControls.provide({
        items: () => props.items,
        index: props.index,
        page,
        pageSize: props.pageSize,
        condition: props.condition,
    });

    async function changePage(newPage: number) {
        if (newPage === page.value || loadingTimestamp.value !== null) {
            return;
        }

        loadingTimestamp.value = Temporal.Now.instant();
        await nextTick();
        await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
        });

        page.value = newPage;
        await nextTick();
        containerRef.value?.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
        });

        const elapsed = Temporal.Now.instant()
            .since(loadingTimestamp.value)
            .total("milliseconds");

        const remaining = props.loadingTime - elapsed;

        if (remaining > 0) {
            await promiseTimeout(remaining);
        }

        loadingTimestamp.value = null;
    }
</script>

<template>
    <section
        ref="container"
        class="relative flex min-h-0 min-w-0 flex-1 flex-col space-y-2"
    >
        <div class="relative grow">
            <template v-if="loading">
                <div class="w-full overflow-hidden bg-background">
                    <slot name="loading-container">
                        <template v-if="loadingMethod === 'multiple'">
                            <div :class="cn('w-full', props.class)">
                                <template v-for="_ in pageSize" :key="_">
                                    <slot name="loading">
                                        <div
                                            class="w-full h-full flex items-center justify-center"
                                        >
                                            <Spinner />
                                        </div>
                                    </slot>
                                </template>
                            </div>
                        </template>

                        <template v-else>
                            <slot name="loading">
                                <div
                                    class="flex h-full w-full items-center justify-center"
                                >
                                    <Spinner class="size-8" />
                                </div>
                            </slot>
                        </template>
                    </slot>
                </div>
            </template>

            <template v-else-if="!items || items.length === 0">
                <slot name="empty" />
            </template>

            <template v-else>
                <Primitive :as="containerAs" :class="cn('w-full', props.class)">
                    <PaginationIterator :items="items" :index="props.index">
                        <template #item="slotProps">
                            <slot name="item" v-bind="slotProps" />
                        </template>
                    </PaginationIterator>
                </Primitive>
            </template>
        </div>

        <PaginationControls @change-page="changePage" />
    </section>
</template>
