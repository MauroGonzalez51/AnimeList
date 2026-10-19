import type { FlatEntry } from "~/lib/schema";
import { _isReadable, _isUniverse, _isWatchable } from "~/lib/store";

export default function (entry: MaybeRefOrGetter<FlatEntry | undefined>) {
    const { t } = useI18n();

    const progress = computed(() => {
        const e = toValue(entry);
        if (!e) {
            return undefined;
        }

        if (_isUniverse(e)) {
            return undefined;
        }

        if ((_isReadable(e) || _isWatchable(e)) && e.status?.watched) {
            return t("domain.entry.status.watched");
        }

        if (_isReadable(e)) {
            const status = e.status;

            if (status?.completed) {
                return t("domain.entry.status.completed");
            }

            if (status?.chapter) {
                return t("domain.entry.status.chapter", {
                    chapter: status.chapter,
                });
            }
        }

        if (_isWatchable(e) && e.status?.episode) {
            return t("domain.entry.status.episode", {
                episode: e.status.episode,
            });
        }

        return undefined;
    });

    const adaptedUntil = computed(() => {
        const e = toValue(entry);
        if (!e) {
            return undefined;
        }

        if (_isUniverse(e) || _isWatchable(e)) {
            return undefined;
        }

        const _progress = e.adaptedUntil;
        if (_progress?.volume) {
            return t("domain.entry.adapted_until.volume", {
                volume: _progress.volume,
            });
        }

        if (_progress?.arc) {
            return t("domain.entry.adapted_until.arc", { arc: _progress.arc });
        }

        if (_progress?.chapter) {
            return t("domain.entry.status.chapter", {
                chapter: _progress.chapter,
            });
        }

        if (_progress?.episode) {
            return t("domain.entry.status.episode", {
                episode: _progress.episode,
            });
        }

        if (_progress?.notes) {
            return _progress.notes;
        }

        return undefined;
    });

    return { progress, adaptedUntil };
}
