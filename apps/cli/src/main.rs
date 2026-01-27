mod utils;

use utils::{Logger, directories};

fn main() -> anyhow::Result<()> {
    #[cfg(debug_assertions)]
    unsafe {
        std::env::set_var("RUST_BACKTRACE", "1");
    }

    let log_file = directories().config_dir.join("anime-list.log");
    Logger::setup(log_file)?;

    Ok(())
}
