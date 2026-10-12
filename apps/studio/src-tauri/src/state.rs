use crate::config::{Config, app_directories};

#[derive(lombok_macros::Getter)]
pub struct AppState {
    config: std::sync::Mutex<Config>,
}

impl AppState {
    pub fn new() -> anyhow::Result<Self> {
        let config = Config::new(app_directories())?;

        Ok(Self {
            config: std::sync::Mutex::new(config),
        })
    }
}
