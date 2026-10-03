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
        .manage(AppState::new())
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

                    let state = app.state::<AppState>();

                    let cli_store_path = match utils::resolve_store::resolve_store_path(&matches)
                    {
                        Ok(path) => path,
                        Err(err) => {
                            eprintln!("{}", err);
                            std::process::exit(1);
                        }
                    };

                    if let Some(path) = cli_store_path {
                        *state.store_path.lock().unwrap() = Some(path);
                    }

                    let current = state.store_path.lock().unwrap().clone();
                    if let Some(path) = current
                        && let Err(err) = utils::store::ensure_store_file(&path)
                    {
                        eprintln!("{}", err);
                        std::process::exit(1);
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
