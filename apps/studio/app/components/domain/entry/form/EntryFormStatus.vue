<script setup lang="ts">
    import { isReadableKind } from "~/lib/store";

    interface Props {
        kind: string;
    }

    defineProps<Props>();
</script>

<template>
    <EntryFormGroup :title="$t('views.entry.id.form.sections.progress')">
        <EntryFormProgress :kind="kind" />
        <EntryFormText
            v-if="isReadableKind(kind)"
            name="status.chapter"
            inputmode="numeric"
            :label="$t('views.entry.id.form.fields.chapter')"
        />
        <EntryFormText
            v-else
            name="status.episode"
            inputmode="numeric"
            :label="$t('views.entry.id.form.fields.episode')"
        />
        <EntryFormSwitch
            name="status.watched"
            :label="$t('views.entry.id.form.fields.watched')"
        />
        <EntryFormSwitch
            v-if="isReadableKind(kind)"
            name="status.completed"
            :label="$t('views.entry.id.form.fields.completed')"
        />
    </EntryFormGroup>

    <EntryFormGroup :title="$t('views.entry.id.form.sections.impressions')">
        <EntryFormText
            name="status.rating"
            inputmode="decimal"
            :label="$t('views.entry.id.form.fields.rating')"
        />
        <EntryFormSwitch
            name="status.favorite"
            :label="$t('views.entry.id.form.fields.favorite')"
        />
        <EntryFormText
            name="status.review"
            multiline
            :label="$t('views.entry.id.form.fields.review')"
        />
    </EntryFormGroup>
</template>
