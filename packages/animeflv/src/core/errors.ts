export class BrowserNotFound extends Error {
    constructor() {
        super("browser executable was not found");
    }
}
