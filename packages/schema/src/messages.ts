export const MESSAGES = {
    BASE_ENTRY_STATUS: {
        WATCHED: "Indicates whether this entry has been watched",
        FAVORITE: "Marks this entry as a personal favorite",
        RATING: "Personal rating for the current entry",
        COMMENTS: "Optional free-form notes or comments",
    },
    WATCHABLE_ENTRY: {
        EPISODE: "Last watched episode of the current entry",
    },
    READABLE_ENTRY: {
        COMPLETED: "Wether the current entry has been fully completed or not",
        CHAPTER: "Last readed chapter of the current entry",
    },
    ENTRY_REFERENCE: "Lightweight reference to another Anime entry.",
    ENTRY: {
        ID: "Stable identifier used for referencing this entry across the dataset",
        REFERENCE:
            "References to other entries by id. Use this field when only a link is needed instead of embedding the full object",
        CHILDS: "Direct child entries of this node. Entries at the same depth level are interpreted as seasons of the same series. Nested children (children of children) represent spin-offs, side stories, or other extended universe content",
        RELATED:
            "Related entries that share the same universe or are connected conceptually, but are not part of the direct hierarchy.",
        STATUS: "Tracking information such as watch progress, reading progress, and personal notes",
        KIND: {
            JP: "Japanese",
            CH: "Chinese",
            KR: "Korean",
        },
    },
    SCHEMA: {
        META: "Metadata about this file, such as its name and repository source",
        ENTRIES:
            "A node representing a media entry within the universe tree. It can be a root node, a series, a movie, or any related media.",
    },
} as const;
