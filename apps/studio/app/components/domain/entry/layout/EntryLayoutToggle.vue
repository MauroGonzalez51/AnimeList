<script setup lang="ts">
    import type { ToggleGroupRootEmits, ToggleGroupRootProps } from "reka-ui";
    import type { z } from "zod";
    import type { LayoutSchema } from "@/components/domain/entry/layout";
    import { LucideLayoutDashboard, LucideLayoutGrid } from "@lucide/vue";
    import { useForwardPropsEmits } from "reka-ui";

    interface LayoutOption {
        icon: Components.LucideIconComponent;
        value: z.infer<typeof LayoutSchema>;
    }

    interface Props extends ToggleGroupRootProps {}

    const props = defineProps<Props>();
    const emits = defineEmits<ToggleGroupRootEmits>();

    const forwarded = useForwardPropsEmits(props, emits);

    const options: LayoutOption[] = [
        {
            icon: LucideLayoutGrid,
            value: "grid",
        },
        {
            icon: LucideLayoutDashboard,
            value: "bento",
        },
    ];
</script>

<template>
    <ToggleGroup v-bind="forwarded" type="single">
        <template v-for="option in options" :key="option.value">
            <ToggleGroupItem :value="option.value" class="cursor-pointer">
                <component :is="option.icon" />
            </ToggleGroupItem>
        </template>
    </ToggleGroup>
</template>
