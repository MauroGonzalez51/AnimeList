<script setup lang="ts">
    import { getGradient } from "@/utils/gradient";

    definePageMeta({
        layout: "sidebar",
    });

    const page = useRouteQuery("page", "1", { transform: Number });
    const store = useStore();
</script>

<template>
    <div class="container mx-auto h-full">
        <PaginationClientSide
            :items="store.store.value?.entries"
            index="name"
            :page="page"
            :page-size="20"
            class="grid grid-cols-[repeat(auto-fill,300px)] justify-center gap-4"
            @change-page="(value) => (page = value)"
        >
            <template #item="{ $item }">
                <Card class="pt-0">
                    <div
                        class="h-25 rounded-t-lg"
                        :style="getGradient([$item.name, $item.kind])"
                    />

                    <CardHeader class="flex justify-between px-4">
                        <CardTitle class="font-medium text-sm">
                            {{ $item.name }}
                        </CardTitle>

                        <div v-if="$item.kind !== '$root'">
                            {{ $item.status?.rating }}
                        </div>
                    </CardHeader>
                </Card>
            </template>
        </PaginationClientSide>
    </div>
</template>
