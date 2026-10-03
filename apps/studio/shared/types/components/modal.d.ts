declare global {
    namespace Components {
        namespace Modal {
            type Kind = "sheet" | "dialog" | "alert-dialog" | "drawer";

            interface State {
                currentModalKey: string | undefined;
                currentKind: Components.Modal.Kind;
                open: boolean;
                componentProps: object;
                containerProps: object;
            }

            interface Args<C extends Component> {
                loader: Components.ComponentLoader<C>;
                kind?: Components.Modal.Kind;
                props?: Components.ComponentProps<C>;
                containerProps?: DialogRootProps;
                key: string;
            }
        }
    }
}

export {};
