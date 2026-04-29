export const SELECTORS = {
    USERNAME_ELEMENT:
        "body > div.Wrapper > header > div > div > div > div.AFixed > nav > div.Login.Online > label > span > strong",
    CARDS: {
        ANIME: {
            ALL: "#ShwGrdLst > ul > li > article",
            ANCHOR: "h3 > a",
        },
    },
    PAGINATION: {
        BUTTON_PREVIOUS: "#ShwGrdLst > div.NvCnAnm > ul > li:first-child > a",
        BUTTON_NEXT: "#ShwGrdLst > div.NvCnAnm > ul > li:last-child > a",
    },
    AUTH: {
        MODAL: "body > div.Wrapper > header > div > div > div > div.AFixed > nav > div.Login",
        INPUT_EMAIL:
            "body > div.Wrapper > header > div > div > div > div.AFixed > nav > div.Login > div > form > label:nth-child(1) > input[type=text]",
        INPUT_PASSWORD:
            "body > div.Wrapper > header > div > div > div > div.AFixed > nav > div.Login > div > form > label:nth-child(2) > input[type=password]:nth-child(1)",
        LOGIN_BUTTON:
            "body > div.Wrapper > header > div > div > div > div.AFixed > nav > div.Login > div > form > button",
    },
    ANIME_PAGE: {
        EPISODES_CONTAINER: "#episodeList",
        EPISODE_ITEM: "#episodeList > li",
        EPISODE_INDEX: "a > p",
        EPISODE_STATUS: 'input[type="checkbox"]',
    },
};
