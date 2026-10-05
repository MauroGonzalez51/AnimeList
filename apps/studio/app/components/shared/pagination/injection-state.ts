interface Args<T> {
    items: MaybeRefOrGetter<T[] | undefined>;
    index: keyof T;
    page: MaybeRefOrGetter<number>;
    pageSize: number;
}

type PaginationItem = { type: "item"; page: number } | { type: "ellipsis" };

const [_provide, _use] = createInjectionState(<T>(args: Args<T>) => {
    const config = useAppConfig();

    const items = computed(() => toValue(args.items));
    const page = computed(() => toValue(args.page));

    const totalPages = computed(() => {
        if (!items.value?.length) {
            return 0;
        }

        return Math.ceil(items.value.length / args.pageSize);
    });

    const hasNext = computed(() => page.value < totalPages.value);
    const hasPrevious = computed(() => page.value > 1);

    const paginationItems = computed<PaginationItem[]>(() => {
        const result: PaginationItem[] = [];

        if (totalPages.value <= config.constants.pagination.MAX_ITEMS) {
            for (let i = 1; i <= totalPages.value; i++) {
                result.push({ type: "item", page: i });
            }

            return result;
        }

        result.push({ type: "item", page: 1 });

        let start = Math.max(2, page.value - 2);
        let end = Math.min(totalPages.value - 1, page.value + 2);

        if (start <= 2) {
            end = 5;
        }

        if (end >= totalPages.value - 1) {
            start = totalPages.value - 4;
        }

        if (start > 2) {
            result.push({ type: "ellipsis" });
        }

        for (let i = start; i <= end; i++) {
            result.push({ type: "item", page: i });
        }

        if (end < totalPages.value - 1) {
            result.push({ type: "ellipsis" });
        }

        result.push({ type: "item", page: totalPages.value });

        return result;
    });

    return {
        items,
        page,
        pageSize: args.pageSize,
        totalPages,
        hasNext,
        hasPrevious,
        paginationItems,
    };
});

function usePaginationControls() {
    const state = _use();
    if (!state) {
        throw createError({
            fatal: true,
            statusText: "use of shared state before injection",
        });
    }

    return state;
}

usePaginationControls.provide = <T>(args: Args<T>) =>
    _provide(args as Args<unknown>);

export { usePaginationControls };
