import {CloverTransport} from '../transport/CloverTransport';
import {CloverDeviceConfiguration} from './CloverDeviceConfiguration';
import {DefaultCloverDevice} from './DefaultCloverDevice';
import {IImageUtil} from '../../../util/IImageUtil';
import {Logger} from "../util/Logger";

/**
 * The base for WebSocket device configurations.
 */
export abstract class WebSocketCloverDeviceConfiguration implements CloverDeviceConfiguration {
    protected logger: Logger = Logger.create();


    private static DEFAULT_RECONNECT_DELAY = 3000; // millis - Also the minimum allowed.
    private static DEFAULT_HEARTBEAT_INTERVAL = -1; // disabled by default
    private static MINIMUM_ALLOWED_HEARTBEAT_INTERVAL = 2500; // millis - Do not allow pings more frequently than 2500.
    private static DEFAULT_HEARTBEAT_DISCONNECT_TIMEOUT = 3000; // millis - Also the minimum allowed.

    private heartbeatInterval; // millis, -1 disables the heartbeat check.
    private heartbeatDisconnectTimeout; // millis, if a response to the heartbeat ping is not received within this time we will call disconnect.
    private reconnectDelay: number; // millis, when disconnected interval at which we will retry.
    protected maxCharInMessage: number = 50000;

    protected webSocketImplClass: any;
    protected imageUtil: IImageUtil;
    private readonly appId: string;

    /**
     * @param {string} applicationId - the applicationId that uniquely identifies the POS. e.g. com.company.MyPOS:2.3.1
     * @param {Object} webSocketFactoryFunction - the function that will return an instance of the CloverWebSocketInterface
     *    that will be used when connecting.
     * @param {IImageUtil} imageUtil - utility to translate images into base64 strings.
     * @param {number} heartbeatInterval - Frequency at which we will ping the device - millis. Defaults to -1, which means the heartbeat check is disabled.
     * @param {number} reconnectDelay - upon disconnect, duration to wait until a reconnect is attempted - millis. Defaults to 3000 (millis), minimum value is 3000 millis. To disable the reconnect set to -1.
     * @param {number} heartbeatDisconnectTimeout - If a response to a heartbeat ping is not received within this time we will call disconnect.
     */
    constructor(applicationId: string,
                webSocketFactoryFunction: any,
                imageUtil: IImageUtil,
                heartbeatInterval?: number,
                reconnectDelay?: number,
                heartbeatDisconnectTimeout?: number) {
        this.imageUtil = imageUtil;
        this.appId = applicationId;
        this.webSocketImplClass = webSocketFactoryFunction;
        this.setHeartbeatInterval(heartbeatInterval);
        this.setReconnectDelay(reconnectDelay);
        this.setHeartbeatDisconnectTimeout(heartbeatDisconnectTimeout)
    }

    public getApplicationId(): string {
        return this.appId;
    }

    public getHeartbeatDisconnectTimeout(): number {
        return Math.max(WebSocketCloverDeviceConfiguration.DEFAULT_HEARTBEAT_DISCONNECT_TIMEOUT, this.heartbeatDisconnectTimeout);
    }

    public setHeartbeatDisconnectTimeout(heartbeatDisconnectTimeout: number): void {
        this.heartbeatDisconnectTimeout = heartbeatDisconnectTimeout || WebSocketCloverDeviceConfiguration.DEFAULT_HEARTBEAT_DISCONNECT_TIMEOUT;
    }

    public getHeartbeatInterval(): number {
        if (this.heartbeatInterval === -1) {
            return this.heartbeatInterval;
        }
        return Math.max(WebSocketCloverDeviceConfiguration.MINIMUM_ALLOWED_HEARTBEAT_INTERVAL, this.heartbeatInterval);
    }

    public setHeartbeatInterval(heartbeatInterval: number): void {
        this.heartbeatInterval = heartbeatInterval || WebSocketCloverDeviceConfiguration.DEFAULT_HEARTBEAT_INTERVAL;
    }

    public getReconnectDelay(): number {
        if (this.reconnectDelay === -1) {
            return this.reconnectDelay;
        }
        return Math.max(WebSocketCloverDeviceConfiguration.DEFAULT_RECONNECT_DELAY, this.reconnectDelay);
    }

    public setReconnectDelay(reconnectDelay: number): void {
        this.reconnectDelay = reconnectDelay || WebSocketCloverDeviceConfiguration.DEFAULT_RECONNECT_DELAY;
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
