use directories::ProjectDirs;
use lombok_macros::{Getter, Setter};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(lombok_macros::Getter)]
pub struct AppDirectories {
    config_file: Option<PathBuf>,
}

impl AppDirectories {
    pub fn new() -> Self {
        Self {
            config_file: ProjectDirs::from("com", "", "animelist-studio")
                .map(|dirs| dirs.config_dir().join("config.toml")),
        }
    }
}

pub fn app_directories() -> &'static AppDirectories {
    static CONFIG: std::sync::OnceLock<AppDirectories> = std::sync::OnceLock::new();
    CONFIG.get_or_init(AppDirectories::new)
}

#[derive(Clone, Serialize, Deserialize, Getter, Setter)]
pub struct Config {
    store_path: Option<PathBuf>,
}

impl Config {
    pub fn new(app_dirs: &AppDirectories) -> anyhow::Result<Self> {
        let config_file = app_dirs
            .config_file
            .clone()
            .ok_or_else(|| anyhow::anyhow!("could not determine config file path"))?;

        let config_directory = config_file
            .parent()
            .ok_or_else(|| anyhow::anyhow!("config file has no parent directory"))?;
        std::fs::create_dir_all(config_directory)?;

        let config = config_file
            .exists()
            .then(|| {
                std::fs::read_to_string(&config_file)
                    .map_err(anyhow::Error::from)
                    .and_then(|content| {
                        toml::from_str::<Config>(&content).map_err(anyhow::Error::from)
                    })
            })
            .transpose()?
            .unwrap_or(Self { store_path: None });

        Ok(config)
    }

    pub fn save(&self, app_dirs: &AppDirectories) -> anyhow::Result<()> {
        let config_file = app_dirs
            .config_file
            .as_ref()
            .ok_or_else(|| anyhow::anyhow!("could not determine config file path"))?;
        let content = toml::to_string_pretty(self)?;
        std::fs::write(config_file, content)?;
        Ok(())
    }
}
