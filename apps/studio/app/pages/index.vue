<script setup lang="ts">
    import type { FlatEntry } from "@/lib/schema";
    import { StoreManager } from "@/lib/schema";

    definePageMeta({
        layout: "sidebar",
    });

    const { $logger } = useNuxtApp();
    const content = useState<FlatEntry[] | null>("content", () => null);
    async function _() {
        const path = await StoreManager.pick();
        if (!path) {
            return;
        }

        const data = (await StoreManager.readContent(path)).match(
            (data) => data,
            (error) => {
                $logger.error(error);
                return null;
            },
        );
        if (!data) {
            return;
        }

        content.value = StoreManager.flatten(data.entries || []);
    }

    const page = useRouteQuery("page", "1", { transform: Number });
</script>

<template>
    <div>
        <Button @click="_">Execute</Button>

        <template v-if="content && content.length > 0">
            <PaginationClientSide
                :items="content"
                index="id"
                :page="page"
                :page-size="3"
                @change-page="(_) => (page = _)"
            >
                <template #item="{ $item }">
                    <pre class="bg-red-50" v-text="$item" />
                </template>
            </PaginationClientSide>
        </template>
    </div>
</template>
