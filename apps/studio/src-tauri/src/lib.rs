mod commands;
mod schema;
mod state;
mod utils;

use crate::state::AppState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() -> anyhow::Result<()> {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState::new()?)
        .invoke_handler(tauri::generate_handler![
            commands::schema::query::query_schema,
            commands::schema::save::save_schema,
            commands::store::clear::clear_store_path,
            commands::store::status::get_store_status,
            commands::store::set::set_store_path,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let state = app.state::<AppState>();
            let current = state.store_path.lock().unwrap().clone();
            if let Some(path) = current
                && let Err(err) = utils::store::ensure_store_file(&path)
            {
                eprintln!("{}", err);
                std::process::exit(1);
            }

            Ok(())
        })
        .run(tauri::generate_context!())?;

    Ok(())
}
