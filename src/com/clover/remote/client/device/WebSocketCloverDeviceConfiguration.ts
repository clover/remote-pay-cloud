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

    protected static MINIMUM_ALLOWED_HEARTBEAT_INTERVAL = 2500; // millis - Do not allow pings more frequently than 2500.
    private static DEFAULT_HEARTBEAT_INTERVAL = -1; // millis, -1 disables the heartbeat check.

    protected heartbeatInterval = WebSocketCloverDeviceConfiguration.DEFAULT_HEARTBEAT_INTERVAL;
    protected heartbeatDisconnectTimeout = 3000; // millis, if a response to the heartbeat ping is not received within this time we will call disconnect.
    protected reconnectDelay: number = WebSocketCloverDeviceConfiguration.DEFAULT_RECONNECT_DELAY;
    protected : number = 4;
    public maxCharInMessage: number = 50000;
    private appId: string;
    protected webSocketImplClass: any;
    protected imageUtil: IImageUtil;

    /**
     * @param {string} applicationId - the applicationId that uniquely identifies the POS. e.g. com.company.MyPOS:2.3.1
     * @param {Object} webSocketFactoryFunction - the function that will return an instance of the CloverWebSocketInterface
     *    that will be used when connecting.
     * @param {IImageUtil} imageUtil - utility to translate images into base64 strings.
     * @param {number} [heartbeatInterval] - Frequency at which we will ping the device - millis. Defaults to 15000 (millis), minimum value is 2500 millis.
     * @param {number} [reconnectDelay] - upon disconnect, duration to wait until a reconnect is attempted - millis. Defaults to 3000 (millis), minimum value is 3000 millis.
     * @param {number} [heartbeatDisconnectTimeout] - If a response to a heartbeat ping is not received within this time we will call disconnect. Defaults to 3000 (millis)
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
        this.setReconnectDelay(this.reconnectDelay);
    }

    public getApplicationId(): string {
        return this.appId;
    }

    public getHeartbeatDisconnectTimeout(): number {
        return this.heartbeatDisconnectTimeout;
    }

    public setHeartbeatDisconnectTimeout(heartbeatDisconnectTimeout: number): void {
        this.heartbeatDisconnectTimeout = heartbeatDisconnectTimeout;
    }

    public getHeartbeatInterval(): number {
        return this.heartbeatInterval;
    }

    public setHeartbeatInterval(heartbeatInterval: number): void {
        if (heartbeatInterval !== -1 && heartbeatInterval < 2500) {
            this.logger.info("The allowed minimum for heartbeatInterval is 2500 ms.  You have set an interval lower than the allowed interval, we are re-setting it to 2500 ms.");
            heartbeatInterval = 2500;
        }
        this.heartbeatInterval = heartbeatInterval;
    }

    public getReconnectDelay(): number {
        return this.reconnectDelay;
    }

    public setReconnectDelay(reconnectDelay: number): void {
        this.reconnectDelay = Math.max(WebSocketCloverDeviceConfiguration.DEFAULT_RECONNECT_DELAY, reconnectDelay || 0);
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
