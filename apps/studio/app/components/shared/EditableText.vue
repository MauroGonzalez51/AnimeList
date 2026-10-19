<script setup lang="ts">
    import type { HTMLAttributes, InputHTMLAttributes } from "vue";

    interface Props {
        class?: HTMLAttributes["class"];
        id?: InputHTMLAttributes["id"];
    }

    const props = withDefaults(defineProps<Props>(), {
        id: () => useId(),
    });

    const editing = useState<boolean>(() => false);

    async function start() {
        editing.value = true;
        await nextTick();

        const element = document.getElementById(props.id);
        if (element && element instanceof HTMLInputElement) {
            element.focus();
            element.select();
        }
    }

    function end() {
        editing.value = false;
    }
</script>

<template>
    <slot v-if="editing" name="input" v-bind="{ id, start, end }" />
    <slot v-else name="display" v-bind="{ start }" />
</template>
