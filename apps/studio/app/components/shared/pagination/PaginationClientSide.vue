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
    });
    defineSlots<Slots>();

    const page = defineModel<number>("page", { required: false, default: 1 });

    const containerRef = useTemplateRef("container");
    const loading = useState<Temporal.Instant | null>(
        NuxtKeys.Components.Pagination.ClientSide.Loading,
        () => null,
    );
    const { items } = usePaginationControls.provide({
        items: props.items,
        index: props.index,
        page,
        pageSize: props.pageSize,
        condition: props.condition,
    });

    async function changePage(newPage: number) {
        if (newPage === page.value || loading.value !== null) {
            return;
        }

        loading.value = Temporal.Now.instant();
        await nextTick();
        await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
        });

        page.value = newPage;
        await nextTick();
        containerRef.value?.scrollIntoView({
            behavior: "auto",
            block: "start",
            inline: "nearest",
        });

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
    <section
        ref="container"
        class="relative flex flex-col grow h-full space-y-2"
    >
        <div class="relative min-h-0 grow">
            <template v-if="!items || items.length === 0">
                <slot name="empty" />
            </template>

            <template v-else>
                <Primitive :as="containerAs" :class="cn('w-full', props.class)">
                    <template
                        v-for="(item, itemIndex) in items"
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
            <div
                v-if="loading"
                class="absolute inset-0 z-10 overflow-hidden bg-background"
            >
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
        </div>

        <PaginationControls @change-page="changePage" />
    </section>
</template>
