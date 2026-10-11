use crate::{config::app_directories, state::AppState};
use std::path::PathBuf;
use tauri::State;

#[tauri::command]
pub fn get_store_path(state: State<'_, AppState>) -> Result<Option<PathBuf>, String> {
    let config = state
        .config
        .lock()
        .map_err(|error| format!("could not lock config: {error}"))?;

    Ok(config.store_path())
}

#[tauri::command]
pub fn set_store_path(state: State<'_, AppState>, store_path: PathBuf) -> Result<(), String> {
    let mut config = state
        .config
        .lock()
        .map_err(|error| format!("could not lock config: {error}"))?;

    config.set_store_path(store_path);
    config
        .save(app_directories())
        .map_err(|error| format!("could not save config: {error}"))
}
