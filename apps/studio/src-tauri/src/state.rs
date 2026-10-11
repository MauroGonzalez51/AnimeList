use crate::config::{Config, app_directories};

pub struct AppState {
    pub config: std::sync::Mutex<Config>,
}

impl AppState {
    pub fn new() -> anyhow::Result<Self> {
        let config = Config::new(app_directories())?;

        Ok(Self {
            config: std::sync::Mutex::new(config),
        })
    }
}
