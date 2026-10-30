# Tasks

## 1. Source loading and in-memory model

- [x] 1.1 Add a migrator lib under `apps/studio/app/lib/migrator/` (or a composable) that reads a dropped `File` as text, parses JSON, and returns the parsed data plus the source file path; verify by loading `.output/scraped-list.json` in the page and seeing the entry count rendered, and an invalid JSON file showing an error and staying in the empty state (covers "Load a JSON source file" scenarios)
- [x] 1.2 Build the reactive source model: an array of source entries plus a fast-access index keyed by in-collection position, mirroring `entries`/`entriesMap`; verify selecting an entry resolves it by key in the index
- [x] 1.3 Implement iterable-collection resolution: iterate the root when it is an array, else expose the array-valued object keys for selection; verify with an array root (no selector shown) and an object root (selector shown, chosen property iterated) — covers "Determine the iterable collection" scenarios

## 2. Schema inference and status tracking

- [x] 2.1 Infer a schema from the loaded JSON with `json-to-zod` and augment it with `__animelist_migrator_status: z.enum(["resolved", "skipped", "pending"]).optional()`; verify the augmented schema accepts an object with and without the status field (covers "Infer a schema with a tracking field")
- [x] 2.2 Implement the processing-set filter: include entries whose `__animelist_migrator_status` is `pending` or absent, exclude `resolved`/`skipped`; verify with a fixture containing one of each status that only pending/absent appear (covers "Process only unresolved entries" scenarios)

## 3. Checkpoint persistence

- [x] 3.1 Add a dedicated single-concurrency write queue (`queue.Queue({ concurrency: 1, autostart: true })`) that serializes the in-memory source document and writes it to the source path via `@tauri-apps/plugin-fs`, separate from the store `WRITE_QUEUE`; verify a mark action writes the file and its contents re-parse
- [x] 3.2 Wire `resolved`/`skipped` mark actions to set the status in memory and enqueue exactly one write; verify no write is enqueued on search/select/store actions, and reloading the written file excludes the marked entries from the processing set (covers "Persist status back to the source file" scenarios, including resume and no-write-on-non-marking)

## 4. Store integration and helper panel

- [x] 4.1 Wire the manual helper to `useStoreManager`: create via `addEntry(draft, undefined)`; attach via `addEntry(draft, { id, source })` with `source` `"children"` or `"related"`, including a nested target id; edit references/fields via `updateEntry`/`patchEntry`; verify a created entry and a child/related attachment appear in the store and nested attachment lands under the nested parent (covers "Act on the store from a source entry" scenarios)
- [x] 4.2 Ensure selecting a source entry performs no store mutation; verify the store is unchanged until a create/attach/edit is submitted (covers "Selecting a source entry does not modify the store")
- [x] 4.3 Pre-fill the create form with hints only (e.g. source label as name), no automatic field mapping; verify submitting without edits creates an entry using only the manual + hinted values

## 5. Search

- [x] 5.1 Add source-entry search that filters the displayed source entries by query; verify a query narrows the list (covers "Search source entries")
- [x] 5.2 Add store-entry search over `entries`/`entriesMap` that filters selectable attach targets; verify a query narrows the targets (covers "Search store entries")

## 6. Page assembly and copy

- [x] 6.1 Replace the `/migrate` page placeholder with the drop zone on top and the two-column layout (left: field selector when object root, source search, current entry, mark actions; right: store search + create/attach/edit helper); verify the full flow loads a file, processes an entry, marks it, and the next entry appears
- [x] 6.2 Replace `DropZoneArea.vue` default `dropzone-content` placeholder copy with migrator copy and add the new i18n keys to `apps/studio/i18n/locales/en.json`; verify the page renders translated strings with no missing-key warnings
- [x] 6.3 Run `pnpm exec prettier --write` then `pnpm exec eslint --fix` on all changed files from `apps/studio`, and run the moon build/typecheck task; verify no lint errors and the build/typecheck passes
