use anyhow::Context;
use std::io::Write;

const LOG_ROTATE_BYTES: u64 = 5 * 1024 * 1024;
static LOG_FILE: std::sync::OnceLock<(std::sync::Mutex<std::fs::File>, std::path::PathBuf)> =
    std::sync::OnceLock::new();

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum LogLevel {
    Debug = 0,
    Info = 1,
    Success = 2,
    Warn = 3,
    Error = 4,
}

#[derive(Debug)]
pub struct Logger {
    level: std::sync::RwLock<LogLevel>,
}

impl Default for Logger {
    fn default() -> Self {
        Self {
            level: std::sync::RwLock::new(LogLevel::Info),
        }
    }
}

impl Logger {
    pub fn setup<T>(path: T) -> anyhow::Result<()>
    where
        T: AsRef<std::path::Path>,
    {
        let path = path.as_ref();

        let file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(path)
            .with_context(|| format!("could not setup logger at: {}", &path.display()))?;

        let _ = LOG_FILE.set((std::sync::Mutex::new(file), path.to_path_buf()));

        Ok(())
    }

    #[allow(dead_code)]
    pub fn set_level(&self, level: LogLevel) {
        if let Ok(mut current_level) = self.level.write() {
            *current_level = level;
        }
    }

    #[allow(dead_code)]
    fn rotate_file(&self, mutex: &std::sync::Mutex<std::fs::File>, path: &std::path::PathBuf) {
        if let Ok(meta) = mutex.lock().unwrap().metadata()
            && meta.len() <= LOG_ROTATE_BYTES
        {
            return;
        }

        drop(mutex.lock().unwrap());

        let rotated = path.with_extension(format!(
            "{}.{}",
            path.extension().and_then(|e| e.to_str()).unwrap_or("log"),
            chrono::Utc::now().format("%Y%m%dT%H%M%SZ")
        ));

        if std::fs::rename(path, &rotated).is_err() {
            fs_extra::file::move_file(path, &rotated, &fs_extra::file::CopyOptions::new())
                .with_context(|| {
                    format!(
                        "could not rename log file from {} to {}",
                        path.display(),
                        rotated.display()
                    )
                })
                .unwrap();
        }

        if let Ok(file) = std::fs::OpenOptions::new()
            .create(true)
            .write(true)
            .truncate(true)
            .open(path)
            .with_context(|| format!("could not create a new log file at {}", &path.display()))
            && let Ok(mut mutex_guard) = mutex.lock()
        {
            *mutex_guard = file;
        }
    }

    #[allow(dead_code)]
    fn write_file<T>(&self, line: T)
    where
        T: std::fmt::Display,
    {
        if let Some((mutex, path)) = LOG_FILE.get() {
            self.rotate_file(mutex, path);
            let _ = writeln!(mutex.lock().unwrap(), "{}", line);
        }
    }
}

#[allow(dead_code)]
pub fn logger() -> &'static Logger {
    static LOGGER: std::sync::OnceLock<Logger> = std::sync::OnceLock::new();
    LOGGER.get_or_init(Logger::default)
}
