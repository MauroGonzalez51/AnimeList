use std::path::PathBuf;

use tauri::State;

use crate::state::AppState;
use crate::utils::{config, store};

/// Sets the active store path, creating an empty file if it does not
/// exist, and persists the choice for future launches.
#[tauri::command]
pub fn set_store_path(path: String, state: State<AppState>) -> Result<String, String> {
    let expanded = shellexpand::full(&path)
        .map(|s| s.into_owned())
        .unwrap_or(path);
    let path = PathBuf::from(expanded);

    store::ensure_store_file(&path)?;
    config::save_store_path(&path)?;

    let resolved = path.to_string_lossy().into_owned();
    *state.store_path.lock().map_err(|e| e.to_string())? = Some(path);

    Ok(resolved)
}
