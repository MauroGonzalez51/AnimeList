import { homeDir } from "@tauri-apps/api/path";

const TILDE_REGEX = /^~(?=\/|$)/;

export async function resolvePath(path: string): Promise<string> {
    if (TILDE_REGEX.test(path)) {
        return path.replace(TILDE_REGEX, await homeDir());
    }

    return path;
}
