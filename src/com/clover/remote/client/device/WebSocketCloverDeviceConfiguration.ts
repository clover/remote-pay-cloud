import {WebSocketCloverTransport} from '../transport/websocket/WebSocketCloverTransport';
import {CloverTransport} from '../transport/CloverTransport';
import {CloverDeviceConfiguration} from './CloverDeviceConfiguration';
import {DefaultCloverDevice} from './DefaultCloverDevice';
import {PairingDeviceConfiguration} from '../transport/PairingDeviceConfiguration';
import {IImageUtil} from '../../../util/IImageUtil';

/**
 * The base for WebSocket device configurations.
 */
export abstract class WebSocketCloverDeviceConfiguration implements CloverDeviceConfiguration {

    protected heartbeatInterval: number = 1000;
    protected reconnectDelay: number = 3000;
    protected pingRetryCountBeforeReconnect: number = 4;
    public maxCharInMessage: number = 50000;
    private appId: string;
    protected webSocketImplClass: any;
    protected imageUtil: IImageUtil;

    /**
     * @param {string} applicationId - the applicationId that uniquely identifies the POS. e.g. com.company.MyPOS:2.3.1
     * @param {Object} webSocketFactoryFunction - the function that will return an instance of the CloverWebSocketInterface
     *    that will be used when connecting.
     * @param {IImageUtil} imageUtil - utility to translate images into base64 strings.
     * @param {number} [heartbeatInterval] - duration to wait for a PING before disconnecting
     * @param {number} [reconnectDelay] - duration to wait until a reconnect is attempted
     */
    constructor(applicationId: string,
                webSocketFactoryFunction: any,
                imageUtil: IImageUtil,
                heartbeatInterval?: number,
                reconnectDelay?: number) {
        this.imageUtil = imageUtil;
        this.appId = applicationId;
        this.webSocketImplClass = webSocketFactoryFunction;
        if (heartbeatInterval) this.heartbeatInterval = Math.max(100, heartbeatInterval);
        if (reconnectDelay) this.reconnectDelay = Math.max(100, reconnectDelay);
    }

    public getApplicationId(): string {
        return this.appId;
    }

    public getHeartbeatInterval(): number {
        return this.heartbeatInterval;
    }

    public setHeartbeatInterval(heartbeatInterval: number): void {
        this.heartbeatInterval = heartbeatInterval;
    }

    public getReconnectDelay(): number {
        return this.reconnectDelay;
    }

    public setReconnectDelay(reconnectDelay: number): void {
        this.reconnectDelay = reconnectDelay;
    }

    public getPingRetryCountBeforeReconnect(): number {
        return this.pingRetryCountBeforeReconnect;
    }

    public setPingRetryCountBeforeReconnect(pingRetryCountBeforeReconnect: number): void {
        this.pingRetryCountBeforeReconnect = pingRetryCountBeforeReconnect;
    }

    public getCloverDeviceType(): any {
        return DefaultCloverDevice;
    }

    public getName(): string {
        return 'Clover WebSocket Connector';
    }

    /**
     * @override
     */
    public getImageUtil(): IImageUtil {
        return this.imageUtil;
    }

    /**
     * @override
     */
    public abstract getMessagePackageName(): string;

    /**
     * @override
     */
    public abstract getCloverTransport(): CloverTransport;

    public getMaxMessageCharacters(): number {
        return this.maxCharInMessage;
    }
}
