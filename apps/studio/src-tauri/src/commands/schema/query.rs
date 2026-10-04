use crate::{schema::Schema, state::AppState};
use tauri::State;

#[tauri::command]
pub fn query_schema(state: State<AppState>) -> Result<Option<Schema>, String> {
    state
        .schema
        .lock()
        .map(|schema| schema.clone())
        .map_err(|error| error.to_string())
}
