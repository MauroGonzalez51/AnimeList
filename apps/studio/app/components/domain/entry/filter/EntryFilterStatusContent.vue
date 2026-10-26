<script setup lang="ts">
    import type {
        OptionChoice,
        OptionKey,
        RangeKey,
        StatusFilter,
    } from "@/components/domain/entry/filter/status";
    import {
        emptyStatusFilter,
        getStatusChips,
        OPTION_CHOICES,
        setOption,
        setRange,
        STATUS_GROUPS,
    } from "@/components/domain/entry/filter/status";

    const model = defineModel<StatusFilter>({ required: true });

    const active = computed(() => getStatusChips(model.value).length);

    function onOption(key: OptionKey, value: unknown) {
        if (!value) {
            return;
        }

        model.value = setOption(model.value, key, value as OptionChoice);
    }

    function onRange(key: RangeKey, bound: "min" | "max", value: unknown) {
        model.value = setRange(model.value, key, bound, value);
    }
</script>

<template>
    <div class="space-y-4">
        <template v-for="(group, index) in STATUS_GROUPS" :key="group.key">
            <Separator v-if="index > 0" />
            <div class="space-y-2">
                <TranslatedMessage
                    :keypath="group.label"
                    class="block text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                />
                <template v-for="field in group.fields" :key="field.key">
                    <div class="flex items-center justify-between gap-3">
                        <TranslatedMessage
                            :keypath="field.label"
                            class="text-sm font-medium"
                        />
                        <ToggleGroup
                            v-if="field.type === 'option'"
                            type="single"
                            variant="outline"
                            size="sm"
                            :model-value="model.options?.[field.key] ?? 'any'"
                            @update:model-value="
                                (value) => onOption(field.key, value)
                            "
                        >
                            <ToggleGroupItem
                                v-for="choice in OPTION_CHOICES"
                                :key="choice.value"
                                :value="choice.value"
                                class="cursor-pointer px-2 text-xs"
                            >
                                <TranslatedMessage :keypath="choice.label" />
                            </ToggleGroupItem>
                        </ToggleGroup>
                        <div
                            v-if="field.type === 'range'"
                            class="flex items-center gap-2"
                        >
                            <NumericInput
                                class="h-8 w-20"
                                :placeholder="
                                    $t('domain.entry.filter.status.range.min')
                                "
                                :model-value="model.ranges?.[field.key]?.min"
                                @update:model-value="
                                    (value) => onRange(field.key, 'min', value)
                                "
                            />
                            <span class="text-muted-foreground">-</span>
                            <NumericInput
                                class="h-8 w-20"
                                :placeholder="
                                    $t('domain.entry.filter.status.range.max')
                                "
                                :model-value="model.ranges?.[field.key]?.max"
                                @update:model-value="
                                    (value) => onRange(field.key, 'max', value)
                                "
                            />
                        </div>
                    </div>
                </template>
            </div>
        </template>
        <Button
            variant="ghost"
            size="sm"
            class="w-full cursor-pointer"
            :disabled="!active"
            @click="model = emptyStatusFilter()"
        >
            <TranslatedMessage keypath="domain.entry.filter.status.reset" />
        </Button>
    </div>
</template>
