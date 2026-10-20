mod commands;
mod config;
mod state;

use state::AppState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() -> anyhow::Result<()> {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::config::get_config,
            commands::config::save_config,
        ])
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let state = AppState::new()?;
            state
                .get_config()
                .lock()
                .map_err(|error| anyhow::anyhow!("could not lock config: {error}"))?
                .allow_in_fs_scope(app)?;

            app.manage(state);

            Ok(())
        })
        .run(tauri::generate_context!())?;

    Ok(())
}
