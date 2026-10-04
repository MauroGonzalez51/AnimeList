use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn clear_store_path(state: State<AppState>) -> Result<(), String> {
    state.update_config(|config| config.store_path = None)?;

    *state.store_path.lock().map_err(|error| error.to_string())? = None;

    *state.schema.lock().map_err(|error| error.to_string())? = None;

    Ok(())
}
