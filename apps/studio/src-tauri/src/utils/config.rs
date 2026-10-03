use directories::ProjectDirs;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(default)]
pub struct AppConfig {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub store_path: Option<PathBuf>,
}

impl AppConfig {
    fn file() -> Option<PathBuf> {
        ProjectDirs::from("com", "maurogonzalez51", "animelist-studio")
            .map(|dirs| dirs.config_dir().join("config.toml"))
    }

    pub fn load() -> Self {
        let Some(file) = Self::file() else {
            return Self::default();
        };

        let Ok(contents) = std::fs::read_to_string(file) else {
            return Self::default();
        };

        toml::from_str(&contents).unwrap_or_default()
    }

    pub fn save(&self) -> Result<(), String> {
        let file = Self::file().ok_or_else(|| "could not resolve config directory".to_string())?;

        if let Some(parent) = file.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }

        let contents = toml::to_string_pretty(self).map_err(|e| e.to_string())?;
        std::fs::write(file, contents).map_err(|e| e.to_string())
    }
}
