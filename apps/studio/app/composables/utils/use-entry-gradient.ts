export default function (id: MaybeRefOrGetter<string>) {
    const colorMode = useColorMode();

    return computed(() => {
        const _id = toValue(id);

        if (colorMode.value === "dark") {
            return getGradient([_id], { lightness: 0.5 });
        }

        return getGradient([_id], { lightness: 0.72 });
    });
}
