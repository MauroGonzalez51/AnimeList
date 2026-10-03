<script setup lang="ts">
    const modal = useModal();
    const hasComponent = computed(() => modal.currentComponent.value !== null);
</script>

<template>
    <div>
        <Sheet
            v-if="modal.state.value.currentKind === 'sheet' && hasComponent"
            v-model:open="modal.state.value.open"
            v-bind="modal.state.value.containerProps"
        >
            <component
                :is="modal.currentComponent.value"
                v-if="modal.currentComponent.value"
                v-bind="modal.state.value.componentProps"
            />
        </Sheet>

        <Dialog
            v-if="modal.state.value.currentKind === 'dialog' && hasComponent"
            v-model:open="modal.state.value.open"
            v-bind="modal.state.value.containerProps"
        >
            <component
                :is="modal.currentComponent.value"
                v-if="modal.currentComponent.value"
                v-bind="modal.state.value.componentProps"
            />
        </Dialog>

        <AlertDialog
            v-if="
                modal.state.value.currentKind === 'alert-dialog' && hasComponent
            "
            v-model:open="modal.state.value.open"
            v-bind="modal.state.value.containerProps"
        >
            <component
                :is="modal.currentComponent.value"
                v-if="modal.currentComponent.value"
                v-bind="modal.state.value.componentProps"
            />
        </AlertDialog>

        <Drawer
            v-if="modal.state.value.currentKind === 'drawer' && hasComponent"
            v-model:open="modal.state.value.open"
            v-bind="modal.state.value.containerProps"
        >
            <component
                :is="modal.currentComponent.value"
                v-if="modal.currentComponent.value"
                v-bind="modal.state.value.componentProps"
            />
        </Drawer>
    </div>
</template>
