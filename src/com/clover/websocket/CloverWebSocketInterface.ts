import {WebSocketListener} from './WebSocketListener'
import {WebSocketState} from './WebSocketState';
import {Logger} from '../remote/client/util/Logger';

/**
 * Used to abstract implementation details to allow for NodeJS and
 * Browser usage of the library.
 *
 * WebSocket Clover Interface.  Abstracts the WebSocket implementation so that the library is not tied to a
 * Browser implementation.
 * 
 * Interface to connect a websocket implementation to.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 */
export abstract class CloverWebSocketInterface {

    private listeners: Array<WebSocketListener>;

    // Create a logger
    private logger: Logger = Logger.create();

    private endpoint: string;

    private webSocket: any;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
        this.listeners = new Array<WebSocketListener>();
    }

    /**
     * For JS impls, we need to abstract out the WebSocket so that the library can be used in
     * browsers and non-browsers.
     *
     * This MUST return immediately!  It cannot use any type of promise or deferral, or the listener
     * will not be properly attached before events begin firing.
     *
     * @param endpoint - the uri to connect to
     */
    public abstract createWebSocket(endpoint: string): any;

    public connect(): CloverWebSocketInterface {
        this.webSocket = this.createWebSocket(this.endpoint);
        this.webSocket.addEventListener("open", function(event) {
            this.notifyOnOpen(event);
        }.bind(this));
        this.webSocket.addEventListener("message", function(event) {
            this.notifyOnMessage(event);
        }.bind(this));
        this.webSocket.addEventListener("close", function(event) {
            this.notifyOnClose(event);
        }.bind(this));
        this.webSocket.addEventListener("error", function(event) {
            this.notifyOnError(event);
        }.bind(this));
        return this;
    }

    ///////
    // https://www.w3.org/TR/2011/WD-websockets-20110419/
    private notifyOnOpen(event: Event) : void {
        this.listeners.forEach((listener: WebSocketListener) => {
            try {
                // check event here for any additional data we can see - headers?
                listener.onConnected(this);
            }
            catch(e) {
                this.logger.error(e);
            }
        });
    }
    private notifyOnMessage(event: MessageEvent) : void {
        this.listeners.forEach((listener: WebSocketListener) => {
            try {
                listener.onTextMessage(this, event.data);
            }
            catch(e) {
                this.logger.error(e);
            }
        });
    }
    private notifyOnError(event: Event) : void {
        this.listeners.forEach((listener: WebSocketListener) => {
            try {
                /*
                According to the spec, only CLOSING or OPEN should occur. This is a 'simple' event.
                 */
                // check event here for any additional data we can see - headers?
                if (this.getReadyState() == WebSocketState.CONNECTING) {
                    listener.onConnectError(this);
                } else if (this.getReadyState() == WebSocketState.CLOSING) {
                    listener.onUnexpectedError(this);
                } else if (this.getReadyState() == WebSocketState.CLOSED) {
                    listener.onDisconnected(this);
                } else if (this.getReadyState() == WebSocketState.OPEN) {
                    listener.onSendError(this);
                }
            }
            catch(e) {
                this.logger.error(e);
            }
        });
    }
    private notifyOnClose(event: CloseEvent) : void {
        this.listeners.forEach((listener: WebSocketListener) => {
            try {
                listener.onCloseFrame(this, event.code, event.reason);
            }
            catch(e) {
                this.logger.error(e);
            }
        });
    }
    ////////


    public sendClose(code?: number, reason?: string): CloverWebSocketInterface {
        this.logger.debug("Close sent code ", code, " reason ", reason);
        this.webSocket.close(code, reason);
        return this;
    }

    public sendText(data: string): CloverWebSocketInterface {
        /*
         Exceptions thrown

         INVALID_STATE_ERR
         The connection is not currently OPEN.
         SYNTAX_ERR
         The data is a string that has unpaired surrogates. (???)
         */
        this.webSocket.send(data);
        return this;
    }

    public getState(): WebSocketState {
        return this.getReadyState();
    }

    public isOpen(): boolean {
        return this.getReadyState() == WebSocketState.OPEN;
    }

    /**
     * Browser implementations do not do pong frames
     */
    public abstract sendPong(): CloverWebSocketInterface;

    /**
     * Browser implementations do not do ping frames
     */
    public abstract sendPing(): CloverWebSocketInterface;

    public addListener(listener: WebSocketListener): void {
        this.listeners.push(listener);
    }
    public removeListener(listener: WebSocketListener): boolean {
        var indexOfListener = this.listeners.indexOf(listener);
        if (indexOfListener !== -1) {
            this.listeners.splice(indexOfListener, 1);
            return true;
        }
        return false;
    }
    public getListeners(): Array<WebSocketListener> {
        return this.listeners.slice();
    }

    // Wrapped functionality below
    public getUrl(): String {
        return this.webSocket.url;
    }
    public getReadyState(): WebSocketState {
        return this.webSocket.readyState;
    }
    public getBufferedAmount(): number {
        return this.webSocket.bufferedAmount;
    }
    public getProtocol(): string {
        return this.webSocket.protocol;
    }
}
