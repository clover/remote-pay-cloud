import {CloverWebSocketInterface} from '../../../../websocket/CloverWebSocketInterface';
import {WebSocketListener} from '../../../../websocket/WebSocketListener';
import {CloverWebSocketClientListener} from './CloverWebSocketClientListener';
import {WebSocketState} from '../../../../websocket/WebSocketState';
import {Logger} from '../../util/Logger';

/**
 * The implementation of the websocket listener.  The websocket connection is
 * initiated from this class, and many of the low level functionality is housed here.
 */
export class CloverWebSocketClient implements WebSocketListener {
    listener: CloverWebSocketClientListener;

    private endpoint: string; // URI
    private webSocketImplClass: any;
    private socket: CloverWebSocketInterface;
    private notifyClose: boolean;

    private logger: Logger = Logger.create();

    constructor(endpoint: string, listener: CloverWebSocketClientListener, webSocketImplClass: any) {
        this.listener = listener;
        this.endpoint = endpoint;
        this.webSocketImplClass = webSocketImplClass;
    }

    public getWebSocketState(): WebSocketState {
        return (this.socket) ? this.socket.getReadyState() : null;
    }

    public getBufferedAmount(): number {
        return (this.socket ? this.socket.getBufferedAmount(): 0);
    }

    public connect(accessToken: string): void {
        if (this.socket != null) {
            throw new Error("Socket already created. Must create a new CloverWebSocketClient");
        }
        try {
            // Kind of odd.  webSocketImplClass is the class definition, we are creating a new one here.
            this.socket = this.webSocketImplClass(this.endpoint);
            // socket.setAutoFlush(true);
            this.socket.addListener(this);
            this.socket.connect(accessToken);
        } catch (e) {
            this.logger.error('connect, connectionError', e);
            this.listener.connectionError(this, e.message);
        }
    }

    public close(code?: number, reason?: string): void {
        this.socket.sendClose(code, reason);
    }

    public isConnecting(): boolean {
        return this.socket.getState() == WebSocketState.CONNECTING;
    }

    public isOpen(): boolean {
        return this.socket.isOpen();
    }

    public isClosing(): boolean {
        return this.socket.getState() == WebSocketState.CLOSING;
    }

    public isClosed(): boolean {
        return this.socket.getState() == WebSocketState.CLOSED;
    }

    public onTextMessage(websocket: CloverWebSocketInterface, text: string): void {
        this.listener.onMessage(this, text);
    }

    public onConnected(websocket: CloverWebSocketInterface): void {
        this.listener.onOpen(this);
    }

    /**
     *
     * @param {CloverWebSocketInterface} websocket
     * @param event - A simple error event is passed per the websocket spec - https://www.w3.org/TR/websockets/#concept-websocket-close-fail
     * It doesn't appear that an exact typing for the websocket error event is available, so I am using any.
     */
    public onConnectError(websocket: CloverWebSocketInterface, event: any): void {
        let eventMessage: string = event.message || "Not available";
        let message: string = `A websocket connection error has occurred.  Details: ${eventMessage}`;
        this.logger.error(message);
        this.listener.connectionError(this, message);
    }

    public onDisconnected(websocket: CloverWebSocketInterface): void {
        this.listener.onClose(this, 1000, "", false);
    }

    public onCloseFrame(websocket: CloverWebSocketInterface, closeCode: number, reason: string): void {
        this.listener.onClose(this, closeCode, reason, true);
    }

    public onError(websocket: CloverWebSocketInterface): void {
        this.logger.error('A websocket error has occurred.');
    }

    public onPingFrame(websocket: CloverWebSocketInterface): void {
        this.socket.sendPong();
    }

    public onSendError(websocket: CloverWebSocketInterface): void {
        this.listener.onSendError("");// frame.getPayloadText());
    }

    public onUnexpectedError(websocket: CloverWebSocketInterface): void {
        this.logger.error('An unexpected websocket error has occurred.');
    }

    public send(message: string): void {
        this.socket.sendText(message);
    }

    public clearListener(): void {
        this.socket.removeListener(this);
    }

    public setNotifyClose(b: boolean): void {
        this.notifyClose = b;
    }

    public shouldNotifyClose(): boolean {
        return this.notifyClose;
    }
}