# AnimeList

Monorepo for managing a personal anime/manga list stored as a single YAML file, plus the tooling around it.

## Repository layout

| Path | What it is |
| --- | --- |
| [`apps/studio`](apps/studio) | **AnimeList Studio**: desktop GUI (Tauri + Nuxt) to edit the data store. |
| [`packages/schema`](packages/schema) | Zod schema of the data store and the generated JSON Schema. |
| [`tools/`](tools) | Shared lint and TypeScript configs. |
| [`AnimeList.yaml`](AnimeList.yaml) | The author's own data store. |

Tasks are orchestrated with [moon](https://moonrepo.dev/) and dependencies are managed with [pnpm](https://pnpm.io/) workspaces.

## Projects

Each project documents how to install and use it in its own section below.

### AnimeList Studio

Desktop app, built from source. There are no prebuilt releases.

#### Requirements

- [Git](https://git-scm.com/)
- [Rust](https://rustup.rs/) (`cargo`)
- [Node.js](https://nodejs.org/)
- A package manager. The installer tries `pnpm`, `bun`, `yarn` and `npm`, in that order. `pnpm` is recommended: the workspace uses `workspace:` dependencies, which `npm` does not support.
- [Python](https://www.python.org/) 3.10 or newer (runs the installer)
- Tauri's system prerequisites for your OS: <https://v2.tauri.app/start/prerequisites/>

The installer checks for the tools above before cloning anything and reports everything that is missing in one go. It does **not** check Tauri's system libraries (e.g. `webkit2gtk-4.1` on Linux), so install those yourself.

#### Install

```
curl -fsSL https://raw.githubusercontent.com/MauroGonzalez51/AnimeList/main/apps/studio/scripts/install.py | python3 -
```

Or, from a local checkout:

```
python3 apps/studio/scripts/install.py
```

The script clones the repository, installs dependencies, builds the release binary (without bundling installers) and installs it:

- **Linux**: copied to `~/.local/bin/animelist-studio`. Make sure `~/.local/bin` is in your `PATH`.
- **Windows / macOS**: the binary is left in `<clone>/target/release/`. Move it somewhere permanent and add that folder to your `PATH`.

#### Update

Run the same command again. If the destination already holds a clone of this repository, it is updated with `git pull --ff-only` instead of cloned. A directory that holds a different repository is refused.

#### Options

| Option | Default | Description |
| --- | --- | --- |
| `--clone-destination` | `<system temp dir>/animelist-studio` | Where the repository is cloned. |

The default lives in the temp directory, so it may be deleted between runs. An update then clones again.

#### Develop

See [`apps/studio/README.md`](apps/studio/README.md).

### Schema

[`packages/schema`](packages/schema) defines the data store with Zod and generates its JSON Schema. The generated file is committed at [`packages/schema/.output/schema.json`](packages/schema/.output/schema.json).

To get editor completion and validation in a store file, point the YAML language server at the schema on `main`:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/MauroGonzalez51/AnimeList/main/packages/schema/.output/schema.json
```

AnimeList Studio writes this header by default. If you set `store_schema_path` in its `config.toml`, it writes the schema to that path on every save and points the header there instead. Whatever that file contained is overwritten.

To regenerate the schema from source:

```
pnpm install
pnpm --filter @animelist/packages-schema build
node packages/schema/dist/cli.mjs save packages/schema/.output/schema.json
```

## Contributing a new project

Add the project under `apps/`, `packages/` or `tools/` (all three are part of the pnpm workspace and moon discovers a `moon.yml` in each), then add a section under [Projects](#projects) with its requirements, install and update steps.
