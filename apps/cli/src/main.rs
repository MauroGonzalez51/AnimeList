mod core;
mod utils;

use anyhow::Context;
use core::constants;
use utils::{Logger, directories};

fn main() -> anyhow::Result<()> {
    #[cfg(debug_assertions)]
    unsafe {
        std::env::set_var("RUST_BACKTRACE", "1");
    }

    let log_file = directories().config_dir.join(constants::LOG_FILE);
    Logger::setup(log_file)?;

    let animelist_file = directories().data_dir.join(constants::ANIME_LIST_FILE);
    std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&animelist_file)
        .with_context(|| {
            format!(
                "could not create list file at: {}",
                &animelist_file.display()
            )
        })?;

    Ok(())
}
