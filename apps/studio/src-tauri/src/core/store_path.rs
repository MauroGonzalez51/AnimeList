pub fn resolve_store_path(
    matches: &tauri_plugin_cli::Matches,
) -> std::option::Option<std::path::PathBuf> {
    matches
        .args
        .get("store")
        .and_then(|a| a.value.as_str())
        .filter(|s| !s.is_empty())
        .map(|s| s.to_string())
        .or_else(|| std::env::var("ANIMELIST_STORE_PATH").ok())
        .map(|path| {
            shellexpand::full(&path)
                .map(|expanded| expanded.into_owned())
                .unwrap_or(path)
        })
        .map(std::path::PathBuf::from)
}
