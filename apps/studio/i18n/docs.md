# i18n message syntax

Reference for the message syntax used in `i18n/locales/*.json`. Messages are
formatted by vue-i18n (via `@nuxtjs/i18n`), so the rules below are vue-i18n's.

## Quick reference

| Syntax | Meaning | Example message | Call |
| --- | --- | --- | --- |
| `a \| b` | Plural forms split by `\|` | `"{count} entry \| {count} entries"` | `$t(key, { count })` |
| `{name}` | Named interpolation | `"Hello, {name}"` | `$t(key, { name })` |
| `{0}` | List interpolation | `"{0} world"` | `$t(key, ["hello"])` |
| `{'text'}` | Literal interpolation | `"{'@'}"` | (none) |
| `@:key` | Linked message | `"See @:common.back"` | (none) |
| `@.upper:key` | Linked message with modifier | `"@.upper:common.name"` | (none) |

## Pluralization

Forms are separated by `|`. Which form is shown depends on the numeric
argument passed to `$t`. The number is read from `count` (or from the
positional argument).

```json
"n_entries": "{count} Entry found | {count} Entries found"
```

```ts
$t("views.home.banner.n_entries", { count: 1 }); // "1 Entry found"
$t("views.home.banner.n_entries", { count: 214 }); // "214 Entries found"
```

With two forms, the first is used for singular and the second for plural. With
three forms, the first is used for 0.

```json
"apple": "no apples | one apple | {count} apples"
```

```ts
$t("apple", { count: 0 }); // "no apples"
$t("apple", { count: 1 }); // "one apple"
$t("apple", { count: 10 }); // "10 apples"
```

The plural category is computed by `Intl.PluralRules` for the active locale.
Custom rules can be provided through the `pluralRules` option of `createI18n`
(see [Custom plural rules](#custom-plural-rules)).

Named arguments used in a plural message do not need to match the plural
variable name. `{n}` works with `{ n: 1 }`:

```json
"banana": "no bananas | {n} banana | {n} bananas"
```

```ts
$t("banana", { n: 1 }, 1); // "1 banana"
$t("banana", 1); // "1 banana" (the number is taken as count)
```

## Interpolation

### Named interpolation

Replaces `{key}` with the matching property of the second argument.

```json
"greeting": "Hello, {name}"
```

```ts
$t("greeting", { name: "John" }); // "Hello, John"
```

### List interpolation

Replaces `{0}`, `{1}`, ... with the items of an array.

```json
"hello": "{0} world"
```

```ts
$t("hello", ["hello"]); // "hello world"
```

### Literal interpolation

Wraps a string literal in single quotes inside braces. Use it for characters
that have a meaning in the syntax, such as `{`, `}` and `@`.

```json
"address": "{account}{'@'}{domain}"
```

```ts
$t("address", { account: "foo", domain: "domain.com" }); // "foo@domain.com"
```

## Linked messages

`@:key` inserts the translation of another key. The linked key can use
interpolations too.

```json
"message": {
  "greeting": "Hello, @.lower:{'message.name'}! You have {count} new messages.",
  "name": "{name}"
},
"welcome": "Welcome, @.upper:{'name'}! Today is @.capitalize:{'day'}.",
"name": "{0}",
"day": "{1}"
```

### Built-in modifiers

| Modifier | Effect |
| --- | --- |
| `@.lower:` | Lowercases the linked message |
| `@.upper:` | Uppercases the linked message |
| `@.capitalize:` | Capitalizes the first letter of the linked message |

### Custom modifiers

Custom modifiers are registered in `createI18n` through the `modifiers` option:

```ts
const i18n = createI18n({
    locale: "en",
    messages: {},
    modifiers: {
        snakeCase: (str) => str.split(" ").join("_"),
    },
});
```

```json
"custom_modifier": "custom modifiers example: @.snakeCase:{'message.snake'}"
```

## Custom plural rules

For languages where `Intl.PluralRules` is not enough, pass a `pluralRules`
function per locale. It receives the number and the number of forms and returns
the form index.

```ts
function customRule(choice: number, choicesLength: number) {
    if (choice === 0)
        return 0;

    const teen = choice > 10 && choice < 20;
    const endsWithOne = choice % 10 === 1;
    if (!teen && endsWithOne)
        return 1;
    if (!teen && choice % 10 >= 2 && choice % 10 <= 4)
        return 2;

    return choicesLength < 4 ? 2 : 3;
}

createI18n({
    locale: "ru",
    pluralRules: { ru: customRule },
    messages: { /* ... */ },
});
```

## Escaping

- A bare `|` in a message is a plural separator. I did not confirm a
  documented escape for it.
- A bare `{` or `}` starts an interpolation. Literal interpolation is the
  documented way to write them.
- A bare `@` may start a linked message. Use `{'@'}`.

## Notes for this project

- Keys are called with `$t` in templates and `t` in `<script setup>`.
- `count` is the value that selects the plural form. Pass it in the options
  object when you also need it in the text.
- In `en.json`, only `n_entries` and `n_references` use `|` plural forms. I did
  not check the other locale files.
