<script setup lang="ts" generic="TData">
    import type { PrimitiveProps } from "reka-ui";
    import type { HTMLAttributes, VNode } from "vue";
    import { promiseTimeout } from "@vueuse/core";
    import { Primitive } from "reka-ui";
    import { Temporal } from "temporal-polyfill";
    import { usePaginationControls } from "@/components/shared/pagination/injection-state";
    import { cn } from "@/lib/utils";

    interface Props {
        items: MaybeRefOrGetter<TData[] | undefined>;
        index: keyof TData;
        page: MaybeRefOrGetter<number>;
        pageSize: number;
        class?: HTMLAttributes["class"];
        containerAs?: PrimitiveProps["as"];
        loadingTime?: number;
    }

    interface Emits {
        changePage: [page: number];
    }

    interface Slots {
        empty: () => VNode[];
        loading: () => VNode[];
        spinner: () => VNode[];
        item: (props: TData & { $item: TData; $index: number }) => VNode[];
    }

    const props = withDefaults(defineProps<Props>(), {
        containerAs: "div",
        loadingTime: 500,
    });
    const emit = defineEmits<Emits>();
    defineSlots<Slots>();

    const containerRef = useTemplateRef("container");
    const loading = useState<Temporal.Instant | null>(
        NuxtKeys.Components.Pagination.ClientSide.Loading,
        () => null,
    );
    const { items, page } = usePaginationControls.provide({
        items: props.items,
        index: props.index,
        page: props.page,
        pageSize: props.pageSize,
    });

    const visibleItems = computed(() => {
        if (!items.value?.length) {
            return [];
        }

        const startIndex = (page.value - 1) * props.pageSize;
        return items.value.slice(startIndex, startIndex + props.pageSize);
    });

    async function changePage(newPage: number) {
        if (newPage === page.value || loading.value !== null) {
            return;
        }

        loading.value = Temporal.Now.instant();

        emit("changePage", newPage);
        if (containerRef.value) {
            containerRef.value.scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "nearest",
            });
        }

        const elapsed = Temporal.Now.instant()
            .since(loading.value)
            .total("milliseconds");

        const remaining = props.loadingTime - elapsed;

        if (remaining > 0) {
            await promiseTimeout(remaining);
        }

        loading.value = null;
    }
</script>

<template>
    <section ref="container" class="flex flex-col grow h-full space-y-2">
        <template v-if="loading">
            <slot name="loading">
                <div class="h-full flex items-center justify-center">
                    <slot name="spinner">
                        <Spinner class="size-6" />
                    </slot>
                </div>
            </slot>
        </template>

        <template v-else-if="!items || items.length === 0">
            <slot name="empty" />
        </template>

        <template v-else>
            <Primitive :as="containerAs" :class="cn('w-full', props.class)">
                <template
                    v-for="(item, itemIndex) in visibleItems"
                    :key="String(item[props.index])"
                >
                    <slot
                        name="item"
                        v-bind="{
                            ...item,
                            $item: item,
                            $index: itemIndex,
                        }"
                    />
                </template>
            </Primitive>
        </template>

        <PaginationControls @change-page="(page) => changePage(page)" />
    </section>
</template>
