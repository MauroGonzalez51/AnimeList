# Spec Delta

## Purpose

The migrator lets the author load a JSON source file, iterate its entries, track per-entry migration progress persisted back into the source file, and manually create or attach Studio store entries from the selected source entry.

## ADDED Requirements

### Requirement: Load a JSON source file

The system SHALL let the user load a single JSON file through the drop zone, parse it, and keep the parsed data and the file path in memory for the session. If the file is not valid JSON, the system SHALL surface an error and SHALL NOT enter the iteration state.

#### Scenario: Valid JSON file loaded

- **WHEN** the user drops or selects a file whose contents parse as JSON
- **THEN** the system stores the parsed data and the source file path in memory
- **AND** the system transitions to the iteration state

#### Scenario: Invalid JSON file rejected

- **WHEN** the user drops or selects a file whose contents do not parse as JSON
- **THEN** the system shows an error message
- **AND** the system remains in the empty (pre-load) state

### Requirement: Determine the iterable collection

The system SHALL iterate an array of objects. When the parsed root is an array, the system SHALL iterate it directly. When the parsed root is an object, the system SHALL present a selector of the object's properties and SHALL iterate the array held by the property the user selects.

#### Scenario: Root is an array

- **WHEN** the loaded JSON root is an array
- **THEN** the system iterates the root array directly
- **AND** the system does not show the field selector

#### Scenario: Root is an object

- **WHEN** the loaded JSON root is an object
- **THEN** the system shows a selector of the object's properties
- **AND** the system iterates the array held by the property the user selects

### Requirement: Infer a schema with a tracking field

The system SHALL infer a schema from the loaded JSON and SHALL augment it with an optional tracking field named `__animelist_migrator_status` whose value is one of `resolved`, `skipped`, or `pending`.

#### Scenario: Tracking field augmented onto inferred schema

- **WHEN** the system infers the schema from the loaded JSON
- **THEN** the resulting schema includes an optional `__animelist_migrator_status` field accepting `resolved`, `skipped`, or `pending`

### Requirement: Process only unresolved entries

The system SHALL treat a source entry as part of the processing set only when its `__animelist_migrator_status` is `pending` or absent. Entries marked `resolved` or `skipped` SHALL be excluded from the processing set. The system SHALL present one entry from the processing set at a time.

#### Scenario: Entry with no status is processed

- **WHEN** a source entry has no `__animelist_migrator_status`
- **THEN** the entry is included in the processing set

#### Scenario: Pending entry is processed

- **WHEN** a source entry has `__animelist_migrator_status` equal to `pending`
- **THEN** the entry is included in the processing set

#### Scenario: Resolved or skipped entry is excluded

- **WHEN** a source entry has `__animelist_migrator_status` equal to `resolved` or `skipped`
- **THEN** the entry is excluded from the processing set

### Requirement: Persist status back to the source file

The system SHALL write a source entry's `__animelist_migrator_status` back to the loaded source file only when the user marks that entry `resolved` or `skipped`. Writes SHALL go through a single-concurrency queue so the file serves as a resumable checkpoint. No other interaction SHALL write to the source file.

#### Scenario: Marking resolved persists status

- **WHEN** the user marks the selected source entry as `resolved`
- **THEN** the system sets that entry's `__animelist_migrator_status` to `resolved` in memory
- **AND** the system enqueues a write of the updated source data to the source file path

#### Scenario: Marking skipped persists status

- **WHEN** the user marks the selected source entry as `skipped`
- **THEN** the system sets that entry's `__animelist_migrator_status` to `skipped` in memory
- **AND** the system enqueues a write of the updated source data to the source file path

#### Scenario: Reloading a partially migrated file resumes progress

- **WHEN** the user loads a source file that already contains `__animelist_migrator_status` values from a previous session
- **THEN** the processing set excludes the entries previously marked `resolved` or `skipped`

#### Scenario: No write on non-marking interactions

- **WHEN** the user searches, selects an entry, or acts on the store without marking the source entry
- **THEN** the system does not write to the source file

### Requirement: Act on the store from a source entry

The system SHALL provide a manual helper panel to act on the Studio store for the selected source entry. The helper SHALL support: creating a new store entry; attaching to an existing store entry as a `children` or `related` node, including nested targets; and editing an existing store entry's references or other fields. The helper SHALL NOT automatically map source fields to store entry fields; it MAY pre-fill obvious starting hints such as the source label as a name. Selecting a source entry SHALL NOT by itself modify the store.

#### Scenario: Create a new store entry

- **WHEN** the user chooses to create a new store entry for the selected source entry
- **THEN** the system opens the manual entry form, optionally pre-filled with hints, and creates the entry in the store on submit

#### Scenario: Attach as a child of an existing entry

- **WHEN** the user selects a store entry as the target and chooses to attach as `children`
- **THEN** the system adds a new store entry whose parent is the selected target with source `children`

#### Scenario: Attach to a nested target

- **WHEN** the user selects a store entry that is itself a child of another entry and attaches a new node to it
- **THEN** the system adds the new node under that nested target

#### Scenario: Selecting a source entry does not modify the store

- **WHEN** the user selects a source entry
- **THEN** the store is unchanged until the user submits a create or attach action

### Requirement: Search source entries and store entries

The system SHALL provide a search over the loaded source entries to pick which entry to process, and a separate search over the store entries to pick a target to attach to.

#### Scenario: Search source entries

- **WHEN** the user enters a query in the source search
- **THEN** the system filters the displayed source entries to those matching the query

#### Scenario: Search store entries

- **WHEN** the user enters a query in the store search
- **THEN** the system filters the selectable store targets to those matching the query
