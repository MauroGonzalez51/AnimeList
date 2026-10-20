use directories::ProjectDirs;
use lombok_macros::{Getter, Setter};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(lombok_macros::Getter)]
pub struct AppDirectories {
    config_file: Option<PathBuf>,
    #[allow(dead_code)]
    schema_path: Option<PathBuf>,
}

impl AppDirectories {
    pub fn new() -> Self {
        let project_dirs = ProjectDirs::from("com", "", "animelist-studio");

        match project_dirs {
            Some(dirs) => Self {
                config_file: Some(dirs.config_dir().join("config.toml")),
                schema_path: Some(dirs.data_dir().join("schema.json")),
            },
            None => Self {
                config_file: None,
                schema_path: None,
            },
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
    store_schema_path: Option<PathBuf>,
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

        let mut config = config_file
            .exists()
            .then(|| {
                std::fs::read_to_string(&config_file)
                    .map_err(anyhow::Error::from)
                    .and_then(|content| {
                        toml::from_str::<Config>(&content).map_err(anyhow::Error::from)
                    })
            })
            .transpose()?
            .unwrap_or(Self {
                store_path: None,
                store_schema_path: None,
            });

        if config.store_schema_path.is_none() {
            config.store_schema_path = app_dirs.schema_path.clone();
        }

        if let Some(schema_directory) = config
            .store_schema_path
            .as_deref()
            .and_then(|path| path.parent())
        {
            std::fs::create_dir_all(schema_directory)?;
        }

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
