# Design

## Context

See proposal.md - Why. The Studio already has a proven pattern for editing a file-backed store: `useStoreManager` keeps entries in reactive memory (`entries` ref + `entriesMap` for fast lookup by id), mutations call `persist()`, and `performWrite` pushes the serialized output onto a single-concurrency `queue.Queue` (`WRITE_QUEUE`) that writes via `@tauri-apps/plugin-fs`. The migrator reuses this shape for its own source file.

Relevant existing building blocks:

- `DropZoneArea.vue` exposes a `dropzone-content` slot bound with `{ data }` (a `File[] | null` model). The migrator supplies slot content and reads the dropped file.
- `useStoreManager` dispatch actions: `addEntry(draft, parent?)`, `updateEntry(id, draft)`, `patchEntry(id, path, value)`, plus `entries` / `entriesMap` for store search and `childCounts`. Attaching as a child/related is `addEntry(draft, { id, source })` where `source` is `"children"` or `"related"` (`SourceType`).
- `json-to-zod` (`^1.1.2`) and `zod` are installed; `queue` and `@tauri-apps/plugin-fs` are already used by the store writer.

The source JSON shape is arbitrary. The author's own `.output/scraped-list.json` is an array of `{ label, url, episodes: { [n]: { watched } } }`, but the migrator must not assume that shape beyond "iterate an array of objects".

## Goals / Non-Goals

**Goals:**

- Load a JSON source file, keep it in memory keyed for fast access, and treat the file as a resumable checkpoint.
- Infer a schema from the loaded JSON and augment it with the optional `__animelist_migrator_status` field.
- Drive manual store mutations (create / attach children / attach related / edit references) reusing `useStoreManager`, without changing store behavior.
- Persist `__animelist_migrator_status` back to the source file only on `resolved` / `skipped`, through a single-concurrency write queue.

**Non-Goals:**

- No automatic field mapping from source to `Entry`. The form is manual.
- No new store write semantics; the migrator is purely a consumer of existing dispatch actions.
- No support for non-JSON source formats (CSV, YAML) in this change.
- No bulk / auto-resolve. The author marks entries one at a time.

## Decisions

### Memory model mirrors the store manager

Keep the loaded source as a reactive array plus an index for fast access and a stable identity per source entry, mirroring `entries` + `entriesMap`. Marking a status mutates the in-memory object and enqueues one write of the whole source document back to its path.

- **Why**: The store manager already proves this pattern works for a file-backed checkpoint. Reusing the mental model keeps the code consistent and the file authoritative across reloads.
- **Stable identity**: source entries have no guaranteed id. Derive a per-session key by array index within the selected collection; identity only needs to be stable within one loaded document, which index satisfies. (If the root is an object, the index is within the selected property's array.)
- **Alternative considered**: diff-and-patch only the changed entry into the file. Rejected — serializing the whole in-memory document is simpler and matches `performWrite`; the source files are small.

### Single-concurrency write queue, separate from the store queue

Use an independent `queue.Queue({ concurrency: 1, autostart: true })` for the source file, distinct from the store's `WRITE_QUEUE`.

- **Why**: The source file and the store file are different destinations with different lifecycles. Sharing a queue would serialize unrelated writes and couple the two.
- **Trigger**: enqueue only inside the `resolved` / `skipped` actions. No other code path writes.

### Schema inference with `json-to-zod`, augmented

Infer the schema from the first-pass JSON with `json-to-zod`, then extend it with `__animelist_migrator_status: z.enum(["resolved", "skipped", "pending"]).optional()` (zod used as-is).

- **Why**: The inferred schema documents the source shape for display/validation; the extra optional field carries migration state without colliding with scraped keys (double-underscore + namespace prefix).
- **Note**: inference is advisory for the UI; the migrator does not reject entries that fail inference, since scraped data is irregular.

### Iterable-collection selection

If `Array.isArray(root)`, iterate it. Otherwise render a selector over `Object.keys(root)` whose values are arrays, and iterate the chosen one.

- **Why**: Matches the spec's two cases with the minimum UI. Only show the selector when needed.

### Store attachment reuses `addEntry(draft, parent)`

Attach-as-child / attach-as-related is `manager.dispatch.addEntry(draft, { id: targetId, source })`. Nested targets work automatically because any store entry id (including a child's) is a valid parent id. Editing references/fields uses `updateEntry` / `patchEntry`.

- **Why**: No new store API. `flattenEntries` already represents children/related as flat entries with `_parentId` + `_source`, so attaching to a nested entry is the same call as attaching to a root.

### Page structure

`/migrate` renders the drop zone on top; after load, a two-column layout: left = iteration view (field selector when root is an object, source search, current source entry, mark `resolved` / `skipped`); right = manual helper (store search + create / attach / edit form). Source panel on the left, store helper on the right, per the proposal.

- **Why**: Directly reflects the spec's interaction surfaces and keeps source concerns and store concerns separated.

## Risks / Trade-offs

- **Writing back to the source file mutates the user's scraped data** → The `__animelist_migrator_status` key is namespaced to avoid clobbering real fields; writes happen only on explicit mark actions; the write serializes the full in-memory document so a crash mid-session loses only unqueued marks, not prior checkpoints.
- **Index-based identity breaks if the source array is reordered between sessions** → Acceptable: the file is the checkpoint and is not reordered by the migrator; reordering externally is out of scope.
- **Inferred schema may be noisy for irregular scraped data** → Inference is advisory only; it never blocks processing an entry.
- **Fast-access map built from arbitrary JSON** → keys are derived, not trusted from the data, avoiding prototype-pollution from attacker-controlled keys.

## Migration Plan

Additive feature. The `/migrate` route is currently a placeholder, so there is no behavior to roll back beyond reverting the new files. No data migration of the store itself. Rollback = revert the change; existing stores and source files are untouched except for `__animelist_migrator_status` keys the user chose to write.
