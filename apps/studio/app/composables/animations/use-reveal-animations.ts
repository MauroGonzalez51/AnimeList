export default function () {
    const { $gsap } = useNuxtApp();
    const utils = useAnimationsUtils();

    function onEnter(element: Element, done: () => void) {
        if (utils.noAnimations.value) {
            done();
            return;
        }

        $gsap.fromTo(
            element,
            { y: 12, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.35,
                ease: "power2.out",
                onComplete: done,
            },
        );
    }

    function onLeave(element: Element, done: () => void) {
        if (utils.noAnimations.value) {
            done();
            return;
        }

        $gsap.to(element, {
            y: 8,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
            onComplete: done,
        });
    }

    return {
        onEnter,
        onLeave,
    };
}
