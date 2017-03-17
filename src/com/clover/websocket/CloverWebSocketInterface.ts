import {WebSocketListener} from './WebSocketListener'
import {WebSocketInterface} from "./WebSocketInterface";
import {WebSocketState} from './WebSocketState';
import {Logger} from '../remote/client/util/Logger';

/**
 * WebSocket Clover Interface
 * 
 * Interface to connect a websocket implementation to.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 */
export abstract class CloverWebSocketInterface extends Array<WebSocketListener> {

    // Create a logger
    private logger: Logger = Logger.create();

    private endpoint: string;

    private webSocket: WebSocketInterface;

    constructor(endpoint: string) {
        super();
        this.endpoint = endpoint;
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
    public abstract createWebSocket(endpoint: string): WebSocketInterface;

    public connect(): CloverWebSocketInterface {
        this.webSocket = this.createWebSocket(this.endpoint);
        this.webSocket.setOnOpen( function (event) {
            this.notifyOnOpen(event).bind(this)
        });
        this.webSocket.setOnMessage( function (event) {
            this.notifyOnClose(event).bind(this);
        });
        this.webSocket.setOnError( function (event) {
            this.notifyOnClose(event).bind(this);
        });
        this.webSocket.setOnClose( function (event: CloseEvent) {
            this.notifyOnClose(event).bind(this);
        });
        return this;
    }

    ///////
    // https://www.w3.org/TR/2011/WD-websockets-20110419/
    private notifyOnOpen(event: Event) {
        this.forEach((listener: WebSocketListener) => {
            try {
                // check event here for any additional data we can see - headers?
                listener.onConnected(this);
            }
            catch(e) {
                this.logger.error(e);
            }
        });
    }
    private notifyOnMessage(event: MessageEvent) {
        this.forEach((listener: WebSocketListener) => {
            try {
                listener.onTextMessage(this, event.data);
            }
            catch(e) {
                this.logger.error(e);
            }
        });
    }
    private notifyOnError(event: Event) {
        this.forEach((listener: WebSocketListener) => {
            try {
                /*
                According to the spec, only CLOSING or OPEN should occur. This is a 'simple' event.
                 */
                // check event here for any additional data we can see - headers?
                if (this.webSocket.getReadyState() == WebSocketState.CONNECTING) {
                    listener.onConnectError(this);
                } else if (this.webSocket.getReadyState() == WebSocketState.CLOSING) {
                    listener.onUnexpectedError(this);
                } else if (this.webSocket.getReadyState() == WebSocketState.CLOSED) {
                    listener.onDisconnected(this);
                } else if (this.webSocket.getReadyState() == WebSocketState.OPEN) {
                    listener.onSendError(this);
                }
            }
            catch(e) {
                this.logger.error(e);
            }
        });
    }
    private notifyOnClose(event: CloseEvent) {
        this.forEach((listener: WebSocketListener) => {
            try {
                listener.onCloseFrame(this, event.code, event.reason);
            }
            catch(e) {
                this.logger.error(e);
            }
        });
    }
    ////////


    public sendClose(): CloverWebSocketInterface {
        this.webSocket.close();
        return this;
    }

    public sendText(data: string): CloverWebSocketInterface {
        this.webSocket.send(data);
        return this;
    }

    public getState(): WebSocketState {
        return this.webSocket.getReadyState()
    }

    public isOpen(): boolean {
        return this.webSocket.getReadyState() == WebSocketState.OPEN;
    }

    public abstract sendPong(): CloverWebSocketInterface;
    public abstract sendPing(): CloverWebSocketInterface;

    addListener(listener: WebSocketListener): void {
        this.push(listener);
    }
    removeListener(listener: WebSocketListener): boolean {
        var indexOfListener = this.indexOf(listener);
        if (indexOfListener !== -1) {
            this.splice(indexOfListener, 1);
            return true;
        }
        return false;
    }
    getListeners(): Array<WebSocketListener> {
        return this.slice();
    }
}
