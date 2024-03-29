import {CloverWebSocketInterface} from './CloverWebSocketInterface'

/**
 * Uses a browser Websocket.
 *
 *
 */
export class BrowserWebSocketImpl extends CloverWebSocketInterface {

    constructor(endpoint: string) {
        super(endpoint);
    }

    /**
     *
     * @override
     * @param endpoint - the url that will connected to
     * @param accessToken - Here the access token is passed as a second param to `new WebSocket()` and will be read
     * by the support server as a "subprotocol" in the Sec-WebSocket-Protocol header value.
     * @returns {WebSocket} - the specific implementation of a websocket
     */
    public createWebSocket(endpoint: string, accessToken?: string): any {
        return new WebSocket(endpoint, accessToken);
    }

    /**
     * Browser implementations do not do pong frames
     */
    public sendPong(): CloverWebSocketInterface {
        return this;
    }

    /**
     * Browser implementations do not do ping frames
     */
    public sendPing(): CloverWebSocketInterface {
        return this;
    }

    /**
     * Create an instance of this class
     *
     * @param endpoint
     * @returns {BrowserWebSocketImpl}
     */
    public static createInstance(endpoint: string): BrowserWebSocketImpl {
        return new BrowserWebSocketImpl(endpoint);
    }
}