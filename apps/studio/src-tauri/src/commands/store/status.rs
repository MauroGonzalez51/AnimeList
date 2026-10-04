use crate::state::AppState;
use tauri::State;

/// Returns the active store path as a string, or `None` if no store
/// is set yet. The frontend uses this on startup to decide whether to
/// show the store picker.
#[tauri::command]
pub fn get_store_status(state: State<AppState>) -> Option<String> {
    state
        .store_path
        .lock()
        .ok()?
        .as_ref()
        .map(|p| p.to_string_lossy().into_owned())
}
