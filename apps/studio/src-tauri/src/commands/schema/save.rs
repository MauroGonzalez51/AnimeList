use crate::{schema::Schema, state::AppState};
use tauri::State;

#[tauri::command]
pub fn save_schema(schema: Schema, state: State<AppState>) -> Result<(), String> {
    let path = state
        .store_path
        .lock()
        .map_err(|error| error.to_string())?
        .clone()
        .ok_or_else(|| "no store path configured".to_owned())?;

    let contents =
        serde_saphyr::to_string(&schema).map_err(|error| error.to_string())?;

    std::fs::write(&path, contents).map_err(|error| error.to_string())?;

    *state.schema.lock().map_err(|error| error.to_string())? = Some(schema);

    Ok(())
}
