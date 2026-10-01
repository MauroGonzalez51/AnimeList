use std::path::{Path, PathBuf};

use directories::ProjectDirs;

fn config_file() -> Option<PathBuf> {
    ProjectDirs::from("com", "maurogonzalez51", "animelist-studio")
        .map(|dirs| dirs.config_dir().join("store.txt"))
}

/// Returns the last store path chosen through the UI, if any.
pub fn load_saved_store_path() -> Option<PathBuf> {
    let path = config_file()?;
    let contents = std::fs::read_to_string(path).ok()?;
    let trimmed = contents.trim();
    if trimmed.is_empty() {
        return None;
    }
    Some(PathBuf::from(trimmed))
}

/// Persists the chosen store path so it is reused on the next launch.
pub fn save_store_path(path: &Path) -> Result<(), String> {
    let file = config_file().ok_or_else(|| "could not resolve config directory".to_string())?;
    if let Some(parent) = file.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    std::fs::write(&file, path.to_string_lossy().as_bytes()).map_err(|e| e.to_string())
}
