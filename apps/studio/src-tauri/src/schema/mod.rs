use serde::{Deserialize, Serialize};

pub type ValueLike = serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum PositiveNumberLike {
    Number(f64),
    String(String),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum EntryRelationType {
    Prequel,
    Sequel,
    Universe,
    Author,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct EntryReference {
    #[serde(rename = "$id")]
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub relation: Option<Vec<EntryRelationType>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct WatchableEntryStatus {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub watched: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub favorite: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rating: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub comments: Option<ValueLike>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episode: Option<PositiveNumberLike>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct ReadableEntryStatus {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub watched: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub favorite: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rating: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub comments: Option<ValueLike>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub completed: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub chapter: Option<PositiveNumberLike>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
#[derive(Default)]
pub enum WatchableKind {
    #[default]
    Anime,
    Donghua,
    Aeni,
    Ova,
    Movie,
    Jdrama,
    Cdrama,
    Kdrama,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum ReadableKind {
    Manga,
    Manhua,
    Manhwa,
    LightNovel,
    WebNovel,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct AdaptedUntil {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub kind: Option<WatchableKind>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub chapter: Option<PositiveNumberLike>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub volume: Option<PositiveNumberLike>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episode: Option<PositiveNumberLike>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub arc: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<ValueLike>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum Entry {
    Root(RootEntry),
    Watchable(WatchableEntry),
    Readable(ReadableEntry),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RootEntry {
    #[serde(rename = "$id")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub kind: String,
    #[serde(rename = "$reference")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reference: Option<Vec<EntryReference>>,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub comments: Option<ValueLike>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub childs: Option<Vec<Entry>>,
    #[serde(rename = "$related")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub related: Option<Vec<Entry>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WatchableEntry {
    #[serde(rename = "$id")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(rename = "$reference")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reference: Option<Vec<EntryReference>>,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub comments: Option<ValueLike>,

    pub kind: WatchableKind,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub chronology: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<WatchableEntryStatus>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub childs: Option<Vec<Entry>>,
    #[serde(rename = "$related")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub related: Option<Vec<Entry>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ReadableEntry {
    #[serde(rename = "$id")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(rename = "$reference")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reference: Option<Vec<EntryReference>>,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub comments: Option<ValueLike>,

    pub kind: ReadableKind,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<ReadableEntryStatus>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub adapted_until: Option<AdaptedUntil>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub childs: Option<Vec<Entry>>,
    #[serde(rename = "$related")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub related: Option<Vec<Entry>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Schema {
    pub meta: Meta,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entries: Option<Vec<Entry>>,
}

impl Default for Schema {
    fn default() -> Self {
        Self {
            meta: Meta::default(),
            entries: Some(Vec::new()),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Meta {
    pub name: String,
    pub github: String,
}

impl Default for Meta {
    fn default() -> Self {
        Self {
            name: String::from("AnimeList"),
            github: String::from("https://github.com/MauroGonzalez51/AnimeList"),
        }
    }
}

impl Schema {
    pub fn load<P>(path: P) -> anyhow::Result<Self>
    where
        P: AsRef<std::path::Path>,
    {
        let content = std::fs::read_to_string(path)?;
        let schema = serde_saphyr::from_str::<Schema>(&content)?;
        Ok(schema)
    }
}
