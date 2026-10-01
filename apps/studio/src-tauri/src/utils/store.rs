use std::path::Path;

/// Ensures the store file exists, creating an empty one if missing.
/// Returns an error if the path exists but is not a regular file,
/// or if the file could not be created.
pub fn ensure_store_file(path: &Path) -> Result<(), String> {
    if path.exists() {
        if path.is_file() {
            return Ok(());
        }
        return Err(format!("{} exists but is not a file", path.display()));
    }

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    std::fs::write(path, b"").map_err(|e| e.to_string())
}
