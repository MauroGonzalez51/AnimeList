<script setup lang="ts">
    interface Props {
        label: string;
    }

    defineOptions({ inheritAttrs: false });

    defineProps<Props>();

    const model = defineModel<number | string | undefined>();

    const id = useId();
</script>

<template>
    <div
        class="group relative **:data-[slot=input]:h-14 **:data-[slot=input]:rounded-none **:data-[slot=input]:border-0 **:data-[slot=input]:bg-transparent **:data-[slot=input]:px-4 **:data-[slot=input]:pt-5 **:data-[slot=input]:pb-1 **:data-[slot=input]:shadow-none **:data-[slot=input]:placeholder:text-transparent **:data-[slot=input]:focus-visible:bg-muted/40 **:data-[slot=input]:focus-visible:ring-0 **:data-[slot=textarea]:min-h-20 **:data-[slot=textarea]:resize-none **:data-[slot=textarea]:rounded-none **:data-[slot=textarea]:border-0 **:data-[slot=textarea]:bg-transparent **:data-[slot=textarea]:px-4 **:data-[slot=textarea]:pt-6 **:data-[slot=textarea]:pb-2 **:data-[slot=textarea]:shadow-none **:data-[slot=textarea]:placeholder:text-transparent **:data-[slot=textarea]:focus-visible:bg-muted/40 **:data-[slot=textarea]:focus-visible:ring-0"
    >
        <slot :id="id" name="input" placeholder=" ">
            <Input :id="id" v-bind="$attrs" v-model="model" placeholder=" " />
        </slot>
        <label
            :for="id"
            class="pointer-events-none absolute top-2 left-4 text-xs text-muted-foreground transition-all group-has-[[data-slot]:placeholder-shown:not(:focus)]:top-4.5 group-has-[[data-slot]:placeholder-shown:not(:focus)]:text-sm motion-reduce:transition-none"
        >
            {{ label }}
        </label>
    </div>
</template>
