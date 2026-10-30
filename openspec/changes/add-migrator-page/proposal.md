# Proposal

## Why

Migrating scraped data (e.g. `.output/scraped-list.json`) into the Studio store is a manual chore: the author reads the source file by hand, finds an entry, then recreates it through the normal entry editor. There is no record of which source entries were already handled, so progress is easy to lose. The migrator turns this into a guided, resumable workflow where the source file itself is the checkpoint.

## What Changes

- Add a new `/migrate` page that loads an arbitrary JSON source file via the existing `DropZoneArea` component.
- Infer a Zod schema from the loaded JSON with `json-to-zod`, then augment it with an optional tracking field `__animelist_migrator_status: "resolved" | "skipped" | "pending"`.
- Determine the iterable collection:
  - If the JSON root is an array, iterate it directly.
  - If the root is an object, show a field selector so the user picks which property holds the array to iterate.
- Show one source entry at a time, filtered to the processing set: only entries whose `__animelist_migrator_status` is `pending` or absent are processed.
- Provide a side panel to act on the selected source entry against the Studio store:
  - create a new store entry,
  - append to an existing entry as a `children` or `related` node (including nested, e.g. a child of a child),
  - edit references or other fields of an existing entry.
  - The form is a fully manual helper: it never auto-maps source fields to `Entry` fields. It only pre-fills obvious hints (e.g. the source label as a starting name) so the author does not have to re-read the file.
- Provide two searches: one over the loaded source entries (to pick what to process) and one over the store entries (to pick a target to attach to).
- Mark a source entry as `resolved` or `skipped`. Marking is the only moment the source file is written back: an in-memory map plus a single-concurrency write queue persists the `__animelist_migrator_status` value to the loaded file, mirroring the store write strategy. The source file acts as the resumable checkpoint.

## Capabilities

### New Capabilities
- `migrator`: Load a JSON source file, iterate its entries, track per-entry migration status persisted back to the source file, and drive manual creation or attachment of store entries from the selected source entry.

### Modified Capabilities
<!-- None. The migrator reuses existing store-manager dispatch actions without changing their behavior. -->

## Impact

- **New page**: `apps/studio/app/pages/migrate/index.vue` (currently a placeholder) becomes the migrator UI.
- **Component**: `apps/studio/app/components/shared/dropzone/DropZoneArea.vue` — its default slot content is replaced with migrator-appropriate copy (existing `dropzone-content` slot already supports this; no API change).
- **New code**: migrator-specific composable(s)/lib under `apps/studio/app/` for source loading, schema inference, the status map, and the write queue.
- **Dependencies**: uses already-installed `json-to-zod` and `zod`; reuses `@tauri-apps/plugin-fs` for reading/writing the source file and the existing `queue` package for the write queue.
- **Store integration**: consumes `useStoreManager` dispatch actions (`addEntry`, `updateEntry`, `patchEntry`) and store entry search; no changes to store write behavior.
- **i18n**: new message keys under `apps/studio/i18n/locales/en.json` for the page copy.
