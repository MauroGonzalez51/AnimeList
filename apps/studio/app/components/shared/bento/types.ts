export interface BentoCell {
    id: string | number;
    x: number;
    y: number;
    width: number;
    height: number;
    component?: Component;
}

export interface BentoContext {
    size: ComputedRef<number>;
    gap: ComputedRef<number>;
}

export const BENTO_KEY: InjectionKey<BentoContext> = Symbol("bento");
