use std::path::Path;

pub fn resolve_store_path(path: &str) -> Result<std::path::PathBuf, String> {
    let expanded = shellexpand::full(path)
        .map(|path| path.into_owned())
        .unwrap_or_else(|_| path.to_string());
    let path = std::path::PathBuf::from(expanded);

    if path.is_absolute() {
        return Ok(path);
    }

    std::env::current_dir()
        .map(|current| current.join(path))
        .map_err(|error| format!("could not resolve current directory: {error}"))
}

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
