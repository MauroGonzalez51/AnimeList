<script setup lang="ts">
    import type { DragDropEvent } from "@tauri-apps/api/webview";
    import type { HTMLAttributes } from "vue";
    import type { AcceptedFormat } from "@/lib/file";
    import { getCurrentWebview } from "@tauri-apps/api/webview";
    import { open } from "@tauri-apps/plugin-dialog";
    import { hasFormat } from "@/lib/file";
    import { cn } from "~/lib/utils";

    interface Props {
        formats?: AcceptedFormat[];
        disabled?: MaybeRefOrGetter<boolean>;
        class?: HTMLAttributes["class"];
    }

    interface Emits {
        select: [path: string];
        reject: [path: string];
    }

    const props = withDefaults(defineProps<Props>(), {
        formats() {
            return [];
        },
    });

    const emit = defineEmits<Emits>();

    const disabled = computed(() => toValue(props.disabled));

    const accepted = computed(() => {
        if (!props.formats.length) {
            return;
        }

        return props.formats
            .flatMap((filter) => filter.extensions)
            .map((extension) => `.${extension}`)
            .join(", ");
    });

    const dropzone = useTemplateRef<HTMLElement>("dropzone");
    const dragging = ref(false);

    function submit(path: string) {
        if (props.formats.length && !hasFormat(path, props.formats)) {
            emit("reject", path);
            return;
        }

        emit("select", path);
    }

    async function pick() {
        const path = await open({
            filters: props.formats.map((format) => ({
                name: format.name,
                extensions: [...format.extensions],
            })),
            multiple: false,
        });

        if (!path) {
            return;
        }

        submit(path);
    }

    function isInside(position: { x: number; y: number }) {
        const element = dropzone.value;
        if (!element) {
            return false;
        }

        const rect = element.getBoundingClientRect();
        const x = position.x / window.devicePixelRatio;
        const y = position.y / window.devicePixelRatio;

        return (
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom
        );
    }

    function handleDrag(payload: DragDropEvent) {
        if (disabled.value || payload.type === "leave") {
            dragging.value = false;
            return;
        }

        if (payload.type !== "drop") {
            dragging.value = isInside(payload.position);
            return;
        }

        dragging.value = false;

        const path = payload.paths[0];
        if (path && isInside(payload.position)) {
            submit(path);
        }
    }

    const unlisten = getCurrentWebview().onDragDropEvent((event) =>
        handleDrag(event.payload),
    );

    onBeforeUnmount(async () => {
        (await unlisten)();
    });
</script>

<template>
    <button
        ref="dropzone"
        type="button"
        :disabled="disabled"
        :class="
            cn(
                'relative min-h-80 cursor-pointer flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
                dragging && 'border-primary bg-primary/5',
                !dragging &&
                    'border-muted-foreground/25 hover:border-muted-foreground/50',
                disabled &&
                    'opacity-60 cursor-not-allowed pointer-events-none grayscale-[0.5] border-muted',
                props.class,
            )
        "
        @click="pick"
    >
        <slot v-bind="{ dragging }" name="dropzone-content">
            <div
                class="flex size-12 items-center justify-center rounded-full bg-muted"
            >
                <LucideUpload class="size-5 text-muted-foreground" />
            </div>
            <div class="max-w-md space-y-1 text-center">
                <p class="text-sm font-medium text-foreground">
                    {{ $t("components.dropzone.title") }}
                </p>
                <p v-if="accepted" class="text-sm text-muted-foreground">
                    {{
                        $t("components.dropzone.accepts", {
                            formats: accepted,
                        })
                    }}
                </p>
            </div>
        </slot>
    </button>
</template>
