use std::path::PathBuf;
use std::sync::Mutex;

#[derive(Default)]
pub struct AppState {
    pub store_path: Mutex<Option<PathBuf>>,
}
