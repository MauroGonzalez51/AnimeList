use crate::state::AppState;
use crate::utils::store;
use tauri::State;

/// Sets the active store path, creating an empty file if it does not
/// exist, and persists the choice for future launches.
#[tauri::command]
pub fn set_store_path(path: String, state: State<AppState>) -> Result<String, String> {
    let path = store::resolve_store_path(&path)?;

    store::ensure_store_file(&path)?;

    state.update_config(|config| config.store_path = Some(path.clone()))?;

    let resolved = path.to_string_lossy().into_owned();
    *state.store_path.lock().map_err(|e| e.to_string())? = Some(path);

    Ok(resolved)
}
