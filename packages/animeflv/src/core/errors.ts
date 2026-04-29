export class BrowserNotFound extends Error {
    constructor() {
        super("browser executable was not found");
    }
}

export class AnimeFLVLoginError extends Error {
    constructor() {
        super(
            "could not login into your account with the provided credentials",
        );
    }
}
