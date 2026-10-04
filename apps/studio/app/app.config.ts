export default defineAppConfig({
    constants: {
        query: {
            CALLBACK_QUERY: "callbackUrl",
        },
        pagination: {
            MAX_ITEMS: 7,
        },
    },
    composables: {
        useModal: {
            MAX_STORAGE_LENGTH: 3,
        },
    },
});
