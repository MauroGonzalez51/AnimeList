<script setup lang="ts">
    import { cn } from "@/lib/utils";

    const store = useStore();
    const filters = useSearchFilters();

    function handleClear() {
        store.dispatch.clear();
        filters.dispatch.clear();
    }
</script>

<template>
    <SidebarMenu>
        <SidebarMenuItem>
            <SidebarMenuButton
                size="lg"
                :class="
                    cn(
                        'group relative flex items-center gap-3 transition-colors duration-200',
                        !store.storePath.value &&
                            'border border-dashed border-sidebar-border hover:border-primary/50 hover:bg-sidebar-accent/50',
                    )
                "
                @click="store.dispatch.pick()"
            >
                <div
                    :class="
                        cn(
                            'aspect-square size-8 rounded-md flex items-center justify-center shrink-0 transition-colors bg-muted text-muted-foreground group-hover:text-foreground',
                            store.storePath.value &&
                                'bg-primary/10 text-primary',
                        )
                    "
                >
                    <LucideFolder class="size-4" />
                </div>

                <div
                    class="grid flex-1 text-left text-sm leading-tight min-w-0"
                >
                    <template v-if="store.storePath.value">
                        <span
                            class="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground"
                        >
                            {{ $t("store.selected") }}
                        </span>
                        <span
                            class="font-medium text-xs truncate text-foreground/90"
                            :title="store.storePath.value"
                        >
                            {{ store.storeFileName.value }}
                        </span>
                    </template>

                    <template v-else>
                        <span
                            class="font-medium text-xs text-foreground/80 group-hover:text-foreground"
                        >
                            {{ $t("store.select") }}
                        </span>
                        <span
                            class="text-[11px] text-muted-foreground truncate"
                        >
                            {{ $t("store.no_file") }}
                        </span>
                    </template>
                </div>

                <Button
                    v-if="store.storePath.value"
                    variant="ghost"
                    size="icon-sm"
                    class="opacity-0 group-hover:opacity-100 transition-opacity size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                    @click.stop="handleClear"
                >
                    <LucideTrash class="size-3.5" />
                </Button>
            </SidebarMenuButton>
        </SidebarMenuItem>
    </SidebarMenu>
</template>
