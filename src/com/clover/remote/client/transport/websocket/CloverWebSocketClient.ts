import {CloverWebSocketInterface} from '../../../../websocket/CloverWebSocketInterface';
import {WebSocketListener} from '../../../../websocket/WebSocketListener';
import {CloverWebSocketClientListener} from './CloverWebSocketClientListener';
import {WebSocketState} from '../../../../websocket/WebSocketState';
import {Logger} from '../../util/Logger';


export class CloverWebSocketClient implements WebSocketListener {
    private endpoint: string; // URI
    listener: CloverWebSocketClientListener;
    heartbeatInterval: number;
    // private WebSocketFactory factory;
    private webSocketImplClass: any;
    private socket: CloverWebSocketInterface;
    private notifyClose: boolean;

    private logger: Logger = Logger.create();

    constructor(endpoint: string, listener: CloverWebSocketClientListener, heartbeatInterval: number, webSocketImplClass:any) {
        this.listener = listener;
        this.heartbeatInterval = heartbeatInterval >= 0 ? Math.min(100, heartbeatInterval) : heartbeatInterval; // can be negative, but > than 100 ms
        this.endpoint = endpoint;
        this.webSocketImplClass = webSocketImplClass;
    }

    public getWebSocketState(): WebSocketState {
        return (this.socket)?this.socket.getReadyState():null;
    }

    public connect(): void {
        if(this.socket != null) {
            throw new Error("Socket already created. Must create a new CloverWebSocketClient");
        }
        try {
            // Kind of odd.  webSocketImplClass is the class definition, we are creating a new one here.
            this.socket = this.webSocketImplClass(this.endpoint);
            // socket.setAutoFlush(true);
            this.socket.addListener(this);
            this.socket.connect();
        } catch(e) {
            this.logger.error('connect, connectionError', e);
            this.listener.connectionError(this);
        }
    }
    public close(): void {
        this.socket.sendClose();
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

    public onTextMessage(websocket: CloverWebSocketInterface, text: string): void{
        this.listener.onMessage(this, text);
    }
    
    public onConnected(websocket: CloverWebSocketInterface): void {
        this.listener.onOpen(this);
    }

    public onConnectError(websocket: CloverWebSocketInterface): void {
        this.logger.error('onConnectError');
        this.listener.connectionError(this);
    }

    public onDisconnected(websocket: CloverWebSocketInterface): void {
        this.listener.onClose(this, 1000, "", false);
    }

    public onCloseFrame(websocket: CloverWebSocketInterface, closeCode: number, reason: string): void {
        this.listener.onClose(this, closeCode, reason, true);
    }

    public onError(websocket: CloverWebSocketInterface): void {
    }

    public onPingFrame(websocket: CloverWebSocketInterface): void {
        this.socket.sendPong();
    }

    public onSendError(websocket: CloverWebSocketInterface): void  {
        this.listener.onSendError("");//frame.getPayloadText());
    }

    public onUnexpectedError(websocket: CloverWebSocketInterface): void {
    }

    public send( message: string): void {
        this.socket.sendText(message);
    }

    public clearListener(): void  {
        this.socket.removeListener(this);
    }

    public setNotifyClose(b: boolean): void {
        this.notifyClose = b;
    }

    public shouldNotifyClose(): boolean {
        return this.notifyClose;
    }
}