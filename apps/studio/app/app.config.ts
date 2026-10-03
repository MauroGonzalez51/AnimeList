export default defineAppConfig({
    constants: {
        query: {
            CALLBACK_QUERY: "callbackUrl",
        },
    },
    composables: {
        useModal: {
            MAX_STORAGE_LENGTH: 3,
        },
    },
});
