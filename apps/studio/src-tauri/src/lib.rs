mod core;

use tauri::Manager;
use tauri_plugin_cli::CliExt;

#[derive(Debug, Clone)]
pub struct AppState {
    pub store_path: std::path::PathBuf,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_cli::init())
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

                    let store_path = match core::store_path::resolve_store_path(&matches) {
                        Some(path) => path,
                        None => {
                            eprintln!("store path not specified. please provide a value");
                            std::process::exit(1);
                        }
                    };

                    app.manage(AppState { store_path });
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
