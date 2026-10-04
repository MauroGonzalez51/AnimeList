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
    pub relation: Option<Vec<EntryRelationType>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct WatchableEntryStatus {
    pub watched: Option<bool>,
    pub favorite: Option<bool>,
    pub rating: Option<f64>,
    pub comments: Option<ValueLike>,
    pub episode: Option<PositiveNumberLike>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct ReadableEntryStatus {
    pub watched: Option<bool>,
    pub favorite: Option<bool>,
    pub rating: Option<f64>,
    pub comments: Option<ValueLike>,
    pub completed: Option<bool>,
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
    pub kind: Option<WatchableKind>,
    pub chapter: Option<PositiveNumberLike>,
    pub volume: Option<PositiveNumberLike>,
    pub episode: Option<PositiveNumberLike>,
    pub arc: Option<String>,
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
    pub id: Option<String>,
    pub kind: String,
    #[serde(rename = "$reference")]
    pub reference: Option<Vec<EntryReference>>,
    pub name: String,
    pub comments: Option<ValueLike>,
    pub childs: Option<Vec<Entry>>,
    #[serde(rename = "$related")]
    pub related: Option<Vec<Entry>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WatchableEntry {
    #[serde(rename = "$id")]
    pub id: Option<String>,
    #[serde(rename = "$reference")]
    pub reference: Option<Vec<EntryReference>>,
    pub name: String,
    pub comments: Option<ValueLike>,

    pub kind: WatchableKind,
    pub chronology: Option<String>,
    pub status: Option<WatchableEntryStatus>,

    pub childs: Option<Vec<Entry>>,
    #[serde(rename = "$related")]
    pub related: Option<Vec<Entry>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ReadableEntry {
    #[serde(rename = "$id")]
    pub id: Option<String>,
    #[serde(rename = "$reference")]
    pub reference: Option<Vec<EntryReference>>,
    pub name: String,
    pub comments: Option<ValueLike>,

    pub kind: ReadableKind,
    pub status: Option<ReadableEntryStatus>,
    pub adapted_until: Option<AdaptedUntil>,

    pub childs: Option<Vec<Entry>>,
    #[serde(rename = "$related")]
    pub related: Option<Vec<Entry>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Schema {
    pub meta: Meta,
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
