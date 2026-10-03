use crate::utils::store;

pub fn resolve_store_path(
    matches: &tauri_plugin_cli::Matches,
) -> Result<std::option::Option<std::path::PathBuf>, String> {
    matches
        .args
        .get("store")
        .and_then(|a| a.value.as_str())
        .filter(|s| !s.is_empty())
        .map(str::to_owned)
        .or_else(|| std::env::var("ANIMELIST_STORE_PATH").ok())
        .as_deref()
        .map(store::resolve_store_path)
        .transpose()
}
