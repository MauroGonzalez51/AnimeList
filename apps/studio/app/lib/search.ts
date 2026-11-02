import { openUrl } from "@tauri-apps/plugin-opener";

const SEARCH_URL = "https://www.google.com/search";

export function openSearch(query: string) {
    const url = new URL(SEARCH_URL);
    url.searchParams.set("q", query);

    return openUrl(url);
}
