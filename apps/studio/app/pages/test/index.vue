<script setup lang="ts">
    definePageMeta({
        middleware: ["dev"],
        layout: "sidebar",
        i18n: {
            paths: {
                en: "/test",
            },
        },
    });

    type Tri = "any" | "yes" | "no";
    type Bound = "min" | "max";
    interface Range {
        min?: number;
        max?: number;
    }
    interface Chip {
        key: string;
        label: string;
    }

    const STATUS_GROUPS = [
        {
            key: "base",
            label: "All entries",
            fields: [
                { key: "favorite", label: "Favorite", type: "tri" },
                { key: "watched", label: "Watched", type: "tri" },
                { key: "review", label: "Reviewed", type: "tri" },
                { key: "rating", label: "Rating", type: "range" },
            ],
        },
        {
            key: "watchable",
            label: "Watchable",
            fields: [{ key: "episode", label: "Episode", type: "range" }],
        },
        {
            key: "readable",
            label: "Readable",
            fields: [
                { key: "completed", label: "Completed", type: "tri" },
                { key: "adaptedUntil", label: "Adapted", type: "tri" },
                { key: "chapter", label: "Chapter", type: "range" },
            ],
        },
    ] as const;

    const STATUS_FIELDS = STATUS_GROUPS.flatMap((group) => group.fields);

    const TRI_OPTIONS: { value: Tri; label: string }[] = [
        { value: "any", label: "Any" },
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
    ];

    const showAll = ref(false);
    const tri = reactive<Record<string, Tri>>({});
    const ranges = reactive<Record<string, Range>>({});

    const chips = computed(() => {
        const result: Chip[] = [];

        for (const field of STATUS_FIELDS) {
            const label = chipLabel(field.key, field.label, field.type);
            if (label) {
                result.push({ key: field.key, label });
            }
        }

        return result;
    });

    function chipLabel(key: string, label: string, type: "tri" | "range") {
        if (type === "tri") {
            return triLabel(key, label);
        }

        return rangeLabel(key, label);
    }

    function triLabel(key: string, label: string) {
        if (tri[key] === "yes") {
            return label;
        }

        if (tri[key] === "no") {
            return `Not ${label}`;
        }
    }

    function rangeLabel(key: string, label: string) {
        const { min, max } = ranges[key] ?? {};

        if (min !== undefined && max !== undefined) {
            return `${label} ${min}–${max}`;
        }

        if (min !== undefined) {
            return `${label} ≥ ${min}`;
        }

        if (max !== undefined) {
            return `${label} ≤ ${max}`;
        }
    }

    function setTri(key: string, value: unknown) {
        if (!value) {
            return;
        }

        tri[key] = value as Tri;
    }

    function setRange(key: string, bound: Bound, value: unknown) {
        const parsed = value === "" ? undefined : Number(value);
        ranges[key] = { ...ranges[key], [bound]: parsed };
    }

    function clear(key: string) {
        delete tri[key];
        delete ranges[key];
    }

    function resetStatus() {
        for (const field of STATUS_FIELDS) {
            clear(field.key);
        }
    }
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="flex flex-wrap items-end gap-3">
            <!-- parentId: always visible, outside the popover -->
            <Label
                class="flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-medium select-none"
            >
                <Switch v-model="showAll" />
                Show all entries
            </Label>

            <!-- status: tri-state and min/max rows inside one popover -->
            <Popover>
                <PopoverTrigger as-child>
                    <Button variant="outline" class="cursor-pointer">
                        <LucideSlidersHorizontal />
                        Status
                        <Badge v-if="chips.length" variant="secondary">
                            {{ chips.length }}
                        </Badge>
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" class="w-80 space-y-4 p-3">
                    <template
                        v-for="(group, index) in STATUS_GROUPS"
                        :key="group.key"
                    >
                        <Separator v-if="index > 0" />
                        <div class="space-y-2">
                            <p
                                class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                            >
                                {{ group.label }}
                            </p>
                            <div
                                v-for="field in group.fields"
                                :key="field.key"
                                class="flex items-center justify-between gap-3"
                            >
                                <span class="text-sm font-medium">
                                    {{ field.label }}
                                </span>
                                <ToggleGroup
                                    v-if="field.type === 'tri'"
                                    type="single"
                                    variant="outline"
                                    size="sm"
                                    :model-value="tri[field.key] ?? 'any'"
                                    @update:model-value="
                                        (value) => setTri(field.key, value)
                                    "
                                >
                                    <ToggleGroupItem
                                        v-for="option in TRI_OPTIONS"
                                        :key="option.value"
                                        :value="option.value"
                                        class="cursor-pointer px-2 text-xs"
                                    >
                                        {{ option.label }}
                                    </ToggleGroupItem>
                                </ToggleGroup>
                                <div v-else class="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        class="h-8 w-20"
                                        :model-value="ranges[field.key]?.min"
                                        @update:model-value="
                                            (value) =>
                                                setRange(
                                                    field.key,
                                                    'min',
                                                    value,
                                                )
                                        "
                                    />
                                    <span class="text-muted-foreground">–</span>
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        class="h-8 w-20"
                                        :model-value="ranges[field.key]?.max"
                                        @update:model-value="
                                            (value) =>
                                                setRange(
                                                    field.key,
                                                    'max',
                                                    value,
                                                )
                                        "
                                    />
                                </div>
                            </div>
                        </div>
                    </template>
                    <Button
                        variant="ghost"
                        size="sm"
                        class="w-full cursor-pointer"
                        :disabled="!chips.length"
                        @click="resetStatus"
                    >
                        Reset
                    </Button>
                </PopoverContent>
            </Popover>
        </div>

        <!-- active chips: visible without opening popover -->
        <div v-if="chips.length" class="flex flex-wrap gap-2">
            <Badge
                v-for="chip in chips"
                :key="chip.key"
                variant="outline"
                class="cursor-pointer"
                @click="clear(chip.key)"
            >
                {{ chip.label }}
                <LucideX class="size-3" />
            </Badge>
        </div>
    </div>
</template>
