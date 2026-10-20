use directories::{BaseDirs, ProjectDirs};
use lombok_macros::{Getter, Setter};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tauri::{Manager, Runtime};
use tauri_plugin_fs::FsExt;

#[derive(lombok_macros::Getter)]
pub struct AppDirectories {
    config_file: Option<PathBuf>,
}

impl AppDirectories {
    pub fn new() -> Self {
        let project_dirs = ProjectDirs::from("com", "", "animelist-studio");

        match project_dirs {
            Some(dirs) => Self {
                config_file: Some(dirs.config_dir().join("config.toml")),
            },
            None => Self { config_file: None },
        }
    }
}

pub fn app_directories() -> &'static AppDirectories {
    static CONFIG: std::sync::OnceLock<AppDirectories> = std::sync::OnceLock::new();
    CONFIG.get_or_init(AppDirectories::new)
}

fn expand_home(path: &Path) -> PathBuf {
    match (path.strip_prefix("~"), BaseDirs::new()) {
        (Ok(rest), Some(dirs)) => dirs.home_dir().join(rest),
        _ => path.to_path_buf(),
    }
}

fn contract_home(path: &Path) -> PathBuf {
    match BaseDirs::new().map(|dirs| path.strip_prefix(dirs.home_dir())) {
        Some(Ok(rest)) => Path::new("~").join(rest),
        _ => path.to_path_buf(),
    }
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

        config.store_path = config.store_path.as_deref().map(expand_home);
        config.store_schema_path = config.store_schema_path.as_deref().map(expand_home);

        if let Some(schema_directory) = config
            .store_schema_path
            .as_deref()
            .and_then(|path| path.parent())
        {
            std::fs::create_dir_all(schema_directory)?;
        }

        Ok(config)
    }

    pub fn allow_in_fs_scope<R: Runtime>(&self, app: &impl Manager<R>) -> anyhow::Result<()> {
        let scope = app.fs_scope();

        for path in [&self.store_path, &self.store_schema_path]
            .into_iter()
            .flatten()
        {
            scope.allow_file(path)?;
        }

        Ok(())
    }

    pub fn save(&self, app_dirs: &AppDirectories) -> anyhow::Result<()> {
        let config_file = app_dirs
            .config_file
            .as_ref()
            .ok_or_else(|| anyhow::anyhow!("could not determine config file path"))?;
        let stored = Self {
            store_path: self.store_path.as_deref().map(contract_home),
            store_schema_path: self.store_schema_path.as_deref().map(contract_home),
        };
        let content = toml::to_string_pretty(&stored)?;
        std::fs::write(config_file, content)?;
        Ok(())
    }
}
