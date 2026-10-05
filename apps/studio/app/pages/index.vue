<script setup lang="ts">
    import { StoreManager } from "@/lib/schema";

    definePageMeta({
        layout: "sidebar",
    });

    const { $logger } = useNuxtApp();
    const content = useState<unknown>("content", () => null);
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
</script>

<template>
    <div>
        <Button @click="_">Execute</Button>
        <pre v-text="content" />
    </div>
</template>
