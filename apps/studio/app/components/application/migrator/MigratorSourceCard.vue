<script setup lang="ts">
    import { isObject } from "es-toolkit/compat";
    import { formatJson } from "~/lib/format";
    import { STATUS_KEY } from "~/lib/migrator";
    import { openSearch } from "~/lib/search";

    const migrator = useMigratorManager();
    const clipboard = useClipboard();

    const fields = computedAsync(async () => {
        const record = migrator.current?.record;
        if (!record) {
            return [];
        }

        const entries = Object.entries(record).filter(
            ([key]) => key !== STATUS_KEY,
        );

        return Promise.all(
            entries.map(async ([key, value]) => ({
                key,
                text: await display(value),
                isObject: isObject(value),
                searchable: typeof value === "string",
            })),
        );
    }, []);

    const emptyMessage = computed(() => {
        if (migrator.keys.length && !migrator.collectionKey) {
            return $t("migrate.source.choose_field");
        }

        if (!migrator.entries.length) {
            return $t("migrate.source.empty");
        }

        return $t("migrate.source.done");
    });

    function select(value: unknown) {
        if (typeof value !== "string") {
            return;
        }

        migrator.dispach.select(value);
    }

    async function display(value: unknown) {
        if (!isObject(value)) {
            return String(value);
        }

        return (await formatJson(JSON.stringify(value))).trim();
    }
</script>

<template>
    <Card class="w-full">
        <CardHeader>
            <CardTitle>{{ $t("migrate.source.title") }}</CardTitle>
            <CardDescription class="tabular-nums">
                {{
                    $t("migrate.source.remaining", {
                        count: migrator.pending.length,
                    })
                }}
            </CardDescription>
        </CardHeader>

        <CardContent class="flex flex-col gap-4">
            <Select
                v-if="migrator.keys.length"
                :model-value="migrator.collectionKey"
                @update:model-value="select"
            >
                <SelectTrigger class="w-full">
                    <SelectValue
                        :placeholder="$t('migrate.source.field_placeholder')"
                    />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem
                        v-for="key in migrator.keys"
                        :key="key"
                        :value="key"
                    >
                        {{ key }}
                    </SelectItem>
                </SelectContent>
            </Select>

            <dl v-if="migrator.current" class="flex flex-col gap-3">
                <div
                    v-for="field in fields"
                    :key="field.key"
                    class="group/field flex flex-col gap-1"
                >
                    <dt class="text-xs text-muted-foreground">
                        <Button
                            v-if="field.searchable"
                            variant="link"
                            :title="$t('migrate.source.search')"
                            class="group h-auto w-fit cursor-pointer gap-1 p-0! text-xs font-normal text-muted-foreground hover:text-foreground hover:no-underline"
                            @click="openSearch(field.text)"
                        >
                            {{ capitalize(field.key) }}
                            <LucideExternalLink
                                class="size-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                            />
                        </Button>
                        <template v-else>
                            {{ capitalize(field.key) }}
                        </template>
                    </dt>

                    <dd v-if="field.isObject">
                        <CodeBlock size="sm">
                            <CodeBlockActions>
                                <CodeBlockCopyButton :value="field.text" />
                            </CodeBlockActions>
                            <CodeBlockContent wrap class="max-h-74">
                                {{ field.text }}
                            </CodeBlockContent>
                        </CodeBlock>
                    </dd>
                    <dd v-else class="flex items-start justify-between gap-2">
                        <span
                            class="text-sm wrap-break-word whitespace-pre-wrap"
                        >
                            {{ field.text }}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            :title="$t('common.clipboard.copy')"
                            :aria-label="$t('common.clipboard.copy')"
                            class="shrink-0 cursor-pointer opacity-0 transition-opacity focus-visible:opacity-100 group-hover/field:opacity-100 pointer-coarse:opacity-100"
                            @click="clipboard.handleCopy(field.text, $event)"
                        >
                            <LucideCopy />
                        </Button>
                    </dd>
                </div>
            </dl>
            <p v-else class="text-sm text-muted-foreground">
                {{ emptyMessage }}
            </p>
        </CardContent>

        <CardFooter class="gap-2">
            <Button
                variant="outline"
                class="cursor-pointer active:scale-[0.97] motion-reduce:active:scale-100"
                :disabled="!migrator.current"
                @click="migrator.dispach.skip"
            >
                {{ $t("migrate.source.skip") }}
            </Button>
            <Button
                class="cursor-pointer active:scale-[0.97] motion-reduce:active:scale-100"
                :disabled="!migrator.current"
                @click="migrator.dispach.resolve"
            >
                {{ $t("migrate.source.resolve") }}
            </Button>
        </CardFooter>
    </Card>
</template>
