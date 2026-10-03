use crate::utils::config::AppConfig;
use std::{path::PathBuf, sync::Mutex};

pub struct AppState {
    pub config: Mutex<AppConfig>,
    pub store_path: Mutex<Option<PathBuf>>,
}

impl AppState {
    pub fn new() -> Self {
        let config = AppConfig::load();
        let store_path = config.store_path.clone();

        Self {
            config: Mutex::new(config),
            store_path: Mutex::new(store_path),
        }
    }

    pub fn update_config<F>(&self, apply: F) -> Result<(), String>
    where
        F: FnOnce(&mut AppConfig),
    {
        let mut config = self.config.lock().map_err(|e| e.to_string())?;

        let mut next = config.clone();
        apply(&mut next);
        next.save()?;

        *config = next;
        Ok(())
    }
}
