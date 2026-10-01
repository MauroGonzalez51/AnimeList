mod commands;
mod state;
mod utils;

use tauri::Manager;
use tauri_plugin_cli::CliExt;

use crate::state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
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

            match app.cli().matches() {
                Ok(matches) => {
                    if matches.args.contains_key("help") {
                        let text = matches.args["help"]
                            .value
                            .as_str()
                            .map(|s| s.to_string())
                            .unwrap_or_else(|| matches.args["help"].value.to_string());

                        println!("{}", text.trim_matches('"'));
                        std::process::exit(0);
                    }

                    // Resolve order: --store / env -> persisted choice -> None.
                    // None is not fatal: the frontend shows a picker and calls
                    // `set_store_path` to establish it at runtime.
                    let resolved = utils::resolve_store::resolve_store_path(&matches)
                        .or_else(utils::config::load_saved_store_path);

                    if let Some(path) = resolved {
                        // Ensure the file exists when it came from CLI/env/config.
                        if let Err(err) = utils::store::ensure_store_file(&path) {
                            eprintln!("{}", err);
                            std::process::exit(1);
                        }
                        let state = app.state::<AppState>();
                        *state.store_path.lock().unwrap() = Some(path);
                    }
                }
                Err(err) => {
                    eprintln!("{}", err);
                    std::process::exit(1);
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
