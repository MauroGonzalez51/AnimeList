// app/composables/useStore.ts
import { invoke } from "@tauri-apps/api/core";

function getStoreStatus() {
    return invoke<string | null>("get_store_status");
}

function setStorePath(path: string) {
    return invoke<string>("set_store_path", { path });
}

export function useStore() {
    const storePath = useState<string | null>("store-path", () => null);
    const ready = computed(() => storePath.value !== null);
    const initialized = useState("store-initialized", () => false);

    async function init() {
        if (initialized.value) return;
        storePath.value = await getStoreStatus();
        initialized.value = true;
    }

    async function pick() {
        const { open } = await import("@tauri-apps/plugin-dialog");
        const selected = await open({
            multiple: false,
            filters: [{ name: "YAML", extensions: ["yaml", "yml"] }],
        });
        if (typeof selected !== "string") return;
        storePath.value = await setStorePath(selected);
    }

    return { storePath, ready, init, pick };
}
