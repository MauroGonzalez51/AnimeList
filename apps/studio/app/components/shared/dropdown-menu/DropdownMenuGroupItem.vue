<script setup lang="ts" generic="TContext">
    interface Props<T> {
        group: Components.Dropdown.Item<T>[];
        context?: MaybeRefOrGetter<T>;
    }

    const props = defineProps<Props<TContext>>();
    const context = computed(() => toValue(props.context));

    function disabled(item: Components.Dropdown.Item<TContext>) {
        if (item.disabled) {
            if (typeof item.disabled === "function") {
                return item.disabled(context.value);
            }

            return toValue(item.disabled);
        }
    }

    function action(item: Components.Dropdown.Item<TContext>) {
        if (item.action) {
            item.action(context.value);
        }
    }
</script>

<template>
    <DropdownMenuGroup>
        <template v-for="item in group" :key="item.label">
            <template v-if="item.sub">
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger :disabled="disabled(item)">
                        <DropdownMenuItemContent
                            :context="context"
                            :item="item"
                        />
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent class="w-48">
                            <template
                                v-for="(_group, index) in item.sub"
                                :key="index"
                            >
                                <DropdownMenuGroupItem :group="_group" />
                                <DropdownMenuSeparator
                                    v-if="index < item.sub.length - 1"
                                />
                            </template>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
            </template>
            <template v-else>
                <DropdownMenuItem
                    :disabled="disabled(item)"
                    :as-child="!!item.to"
                    @click="action(item)"
                >
                    <DropdownMenuItemContent :context="context" :item="item" />
                </DropdownMenuItem>
            </template>
        </template>
    </DropdownMenuGroup>
</template>
