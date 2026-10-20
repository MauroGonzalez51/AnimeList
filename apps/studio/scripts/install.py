#!/usr/bin/env python3
import argparse
import logging
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPOSITORY = "https://github.com/MauroGonzalez51/AnimeList"
HOME = Path.home()
PACKAGE_MANAGERS = ["pnpm", "bun", "yarn", "npm"]
GIT = ["git", "-c", "http.lowSpeedLimit=1000", "-c", "http.lowSpeedTime=30"]
REQUIRED_TOOLS = ["git", "cargo", "node"]
BINARY = "animelist-studio" + (".exe" if sys.platform == "win32" else "")


def _run(
    cmd: list[str],
    *,
    logger: logging.Logger | None,
    cwd: Path | None = None,
    fatal: bool = True,
) -> bool:
    formatted = " ".join(cmd)
    if logger:
        logger.info(f"(running) {formatted}")

    result = subprocess.run(cmd, cwd=cwd, check=False)
    if result.returncode == 0:
        return True

    if logger:
        logger.error(f"error while executing: {formatted}")
    if fatal:
        sys.exit(result.returncode)
    return False


def _origin(path: Path) -> str:
    result = subprocess.run(
        ["git", "-C", str(path), "remote", "get-url", "origin"],
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout.strip().removesuffix("/").removesuffix(".git")


def clone_repository(path: Path, *, logger: logging.Logger) -> None:
    if (path / ".git").exists():
        origin = _origin(path)
        if origin != REPOSITORY:
            logger.error(f"{path} is a different repository ({origin or 'no origin'})")
            sys.exit(1)

        logger.info("repository already cloned, updating it")
        _run([*GIT, "-C", str(path), "pull", "--ff-only"], logger=logger)
        return

    _run(
        [*GIT, "clone", "--depth", "1", REPOSITORY, str(path)],
        logger=logger,
    )


def install_dependencies(path: Path, *, logger: logging.Logger) -> str:
    for manager in PACKAGE_MANAGERS:
        if not shutil.which(manager):
            continue

        if _run([manager, "install"], logger=logger, cwd=path, fatal=False):
            return manager

        logger.warning(f"{manager} failed, trying the next one")

    logger.error(
        f"could not install dependencies with any of: {', '.join(PACKAGE_MANAGERS)}"
    )
    sys.exit(1)


def build_application(path: Path, *, logger: logging.Logger) -> Path:
    app = path / "apps" / "studio"

    tauri = shutil.which("tauri", path=str(app / "node_modules" / ".bin"))
    if not tauri:
        logger.error("tauri cli not found after installing dependencies")
        sys.exit(1)

    _run([tauri, "build", "--no-bundle"], logger=logger, cwd=app)

    return path / "target" / "release" / BINARY


def move_binary(binary: Path, *, logger: logging.Logger) -> None:
    if not sys.platform.startswith("linux"):
        if binary.resolve().is_relative_to(Path(tempfile.gettempdir()).resolve()):
            logger.warning(
                f"{binary} is in a temporary directory and may be deleted; "
                f"move {binary.name} somewhere permanent and add that folder to your PATH"
            )
        else:
            logger.warning(f"add {binary.parent} to your PATH to run {binary.name}")
        return

    destination = HOME / ".local" / "bin"
    destination.mkdir(parents=True, exist_ok=True)

    staged = destination / f".{binary.name}.new"
    shutil.copy2(binary, staged)
    os.replace(staged, destination / binary.name)
    logger.info(f"installed: {destination / binary.name}")

    if str(destination) not in os.environ.get("PATH", "").split(os.pathsep):
        logger.warning(f"{destination} is not in your PATH")


def check_requirements(*, logger: logging.Logger) -> None:
    missing = [tool for tool in REQUIRED_TOOLS if not shutil.which(tool)]
    if not any(shutil.which(manager) for manager in PACKAGE_MANAGERS):
        missing.append(f"a package manager ({', '.join(PACKAGE_MANAGERS)})")

    if missing:
        logger.error(f"missing requirements: {', '.join(missing)}")
        sys.exit(1)


def main(*, clone_destination: Path) -> None:
    logger = logging.getLogger(name="default")

    check_requirements(logger=logger)
    os.environ["GIT_TERMINAL_PROMPT"] = "0"

    if not clone_destination.exists():
        logger.info("clone-destination does not exists, creating it")
        clone_destination.parent.mkdir(parents=True, exist_ok=True)

    clone_repository(clone_destination, logger=logger)
    install_dependencies(clone_destination, logger=logger)
    binary = build_application(clone_destination, logger=logger)
    move_binary(binary, logger=logger)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )

    parser.add_argument(
        "--clone-destination",
        default=Path(tempfile.gettempdir()) / "animelist-studio",
        dest="clone_destination",
    )

    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    main(clone_destination=Path(args.clone_destination))
