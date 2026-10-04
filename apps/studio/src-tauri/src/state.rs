use crate::{
    schema::Schema,
    utils::{config::AppConfig, store::ensure_store_file},
};
use std::{path::PathBuf, sync::Mutex};

pub struct AppState {
    pub config: Mutex<AppConfig>,
    pub schema: Mutex<Option<Schema>>,
    pub store_path: Mutex<Option<PathBuf>>,
}

impl AppState {
    pub fn new() -> anyhow::Result<Self> {
        let config = AppConfig::load();
        let store_path = config.store_path.clone();

        let schema = store_path
            .as_ref()
            .map(|path| {
                ensure_store_file(path).map_err(anyhow::Error::msg)?;
                Schema::load(path)
            })
            .transpose()?;

        Ok(Self {
            config: Mutex::new(config),
            schema: Mutex::new(schema),
            store_path: Mutex::new(store_path),
        })
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
