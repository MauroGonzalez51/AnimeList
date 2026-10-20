use crate::{
    config::{Config, app_directories},
    state::AppState,
};
use tauri::{AppHandle, State};

#[tauri::command]
pub fn get_config(state: State<'_, AppState>) -> anyhow::Result<Config, String> {
    let config = state
        .get_config()
        .lock()
        .map_err(|error| format!("could not lock config: {}", error))?;

    Ok(config.clone())
}

#[tauri::command]
pub fn save_config(
    app: AppHandle,
    state: State<'_, AppState>,
    config: Config,
) -> anyhow::Result<Config, String> {
    config
        .allow_in_fs_scope(&app)
        .map_err(|error| format!("could not allow config paths: {error}"))?;

    config
        .save(app_directories())
        .map_err(|error| format!("could not save config: {error}"))?;

    let mut current_config = state
        .get_config()
        .lock()
        .map_err(|error| format!("could not lock config: {error}"))?;

    *current_config = config;

    Ok(current_config.clone())
}
