<script setup lang="ts">
    import { blankToUndefined, parseNumber } from "~/lib/utils";

    interface Props {
        inputmode?: "numeric" | "decimal";
    }

    withDefaults(defineProps<Props>(), { inputmode: "numeric" });

    const model = defineModel<number | string | undefined>();

    const draft = ref(String(model.value ?? ""));

    watch(model, (value) => {
        if (parseNumber(draft.value) !== value) {
            draft.value = String(value ?? "");
        }
    });

    function onInput(text: string | number) {
        draft.value = String(text);
        model.value = blankToUndefined(parseNumber(draft.value));
    }
</script>

<template>
    <Input
        :inputmode="inputmode"
        :model-value="draft"
        @update:model-value="onInput"
    />
</template>
