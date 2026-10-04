#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    if let Err(error) = app_lib::run() {
        eprintln!("{error:#}");
        std::process::exit(1);
    };
}
