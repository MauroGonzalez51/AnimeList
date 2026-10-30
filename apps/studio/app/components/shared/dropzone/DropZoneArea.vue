<script setup lang="ts">
    import type { DialogFilter } from "@tauri-apps/plugin-dialog";
    import type { UseDropZoneOptions } from "@vueuse/core";
    import { cn } from "~/lib/utils";

    interface Props {
        filter?: DialogFilter[];
        disabled?: MaybeRefOrGetter<boolean>;
        options?: UseDropZoneOptions;
    }

    const props = withDefaults(defineProps<Props>(), {
        options() {
            return { preventDefaultForUnhandled: true };
        },
    });

    const data = defineModel<File[] | null>({ default: () => [] });

    const disabled = computed(() => toValue(props.disabled));

    const dropzone = useTemplateRef<HTMLElement>("dropzone");
    const { isOverDropZone } = useDropZone(dropzone, {
        onDrop(files) {
            data.value = files;
        },
        onOver(_, event) {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = "copy";
            }
        },
        onLeave(_, event) {
            event.preventDefault();
        },
        ...props.options,
    });

    function _handleChange(event: Event) {
        const target = event.target;
        if (!(target instanceof HTMLInputElement) || !target.files) {
            return;
        }

        data.value = Array.from(target.files);
    }
</script>

<template>
    <Label
        ref="dropzone"
        :class="
            cn(
                'relative min-h-80 cursor-pointer flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
                isOverDropZone && 'border-primary bg-primary/5',
                !isOverDropZone &&
                    'border-muted-foreground/25 hover:border-muted-foreground/50',
                disabled &&
                    'opacity-60 cursor-not-allowed pointer-events-none grayscale-[0.5] border-muted',
            )
        "
    >
        <Input
            type="file"
            :disabled="disabled"
            class="sr-only"
            @change="_handleChange"
        />

        <slot v-bind="{ data }" name="dropzone-content">
            <div
                class="flex size-12 items-center justify-center rounded-full bg-muted"
            >
                <LucideUpload class="size-5 text-muted-foreground" />
            </div>
            <div class="max-w-md space-y-1 text-center">
                <p class="text-sm font-medium text-foreground">
                    {{ $t("components.dropzone.migrate.title") }}
                </p>
                <p class="text-sm text-muted-foreground">
                    {{ $t("components.dropzone.migrate.description") }}
                </p>
            </div>
        </slot>
    </Label>
</template>
