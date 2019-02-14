import {WebSocketCloudCloverTransport} from '../transport/websocket/WebSocketCloudCloverTransport';
import {CloverTransport} from '../transport/CloverTransport';
import {WebsocketCloudCloverDevice} from './WebsocketCloudCloverDevice';

import {WebSocketCloverDeviceConfiguration} from './WebSocketCloverDeviceConfiguration';
import {HttpSupport} from '../../../util/HttpSupport';
import {IImageUtil} from '../../../util/IImageUtil';
import {ImageUtil} from '../../../util/ImageUtil';
import {BrowserWebSocketImpl} from '../../../websocket/BrowserWebSocketImpl';

/**
 * Configuration used to create a connection to a device via the Clover cloud.
 */
export class WebSocketCloudCloverDeviceConfiguration extends WebSocketCloverDeviceConfiguration {

    private cloverServer: string;
    private accessToken: string;
    private httpSupport: HttpSupport;
    private merchantId: string;
    private deviceId: string;
    private friendlyId: string;
    private forceConnect: boolean;

    /**
     *
     * @param {string} applicationId - the applicationId that uniquely identifies the POS.
     *    e.g. com.company.MyPOS:2.3.1 for the first connection
     * @param {Object} webSocketFactoryFunction - the function that will return an instance of the
     *  CloverWebSocketInterface that will be used when connecting.  For Browser implementations, this can be
     *  BrowserWebSocketImpl.createInstance.  For NodeJS implementations, this will be defined differently.
     * @param {IImageUtil} imageUtil - utility to translate images into base64 strings.
     * @param {string} cloverServer the base url for the clover server used in the cloud connection.
     *    EX:  https://www.clover.com, http://localhost:9000
     * @param {string} accessToken - the OAuth access token that will be used when contacting the clover server
     * @param {HttpSupport} httpSupport - the helper object used when making http requests.
     * @param {string} merchantId - the merchant the device belongs to.
     * @param {string} deviceId - the id (not uuid) of the device to connect to
     * @param {string} friendlyId - an identifier for the specific terminal connected to this device.  This id is used
     *  in debugging and may be sent to other clients if they attempt to connect to the same device.  It will also be
     *  sent to other clients that are currently connected if this device does a forceConnect.
     * @param {boolean} forceConnect - if true, overtake any existing connection.
     * @param {number} [heartbeatInterval] - Frequency at which we will ping the device - millis. Defaults to -1 (disabled), minimum value is 2500 millis.
     * @param {number} [reconnectDelay] - upon disconnect, duration to wait until a reconnect is attempted - millis. Defaults to 3000 (millis), minimum value is 3000 millis.
     * @param {number} [heartbeatDisconnectTimeout] - If a response to a heartbeat ping is not received within this time we will call disconnect.  Defaults to 3000 (millis).
     */
    constructor(applicationId: string,
                webSocketFactoryFunction: any,
                imageUtil: IImageUtil,
                cloverServer: string,
                accessToken: string,
                httpSupport: HttpSupport,
                merchantId: string,
                deviceId: string,
                friendlyId: string,
                forceConnect: boolean = false,
                heartbeatInterval?: number,
                reconnectDelay?: number,
                heartbeatDisconnectTimeout?: number) {
        super(applicationId,
            webSocketFactoryFunction,
            imageUtil,
            heartbeatInterval,
            reconnectDelay,
            heartbeatDisconnectTimeout);
        this.cloverServer = cloverServer;
        this.accessToken = accessToken;
        this.httpSupport = httpSupport;
        this.merchantId = merchantId;
        this.deviceId = deviceId;
        this.friendlyId = friendlyId;
        this.forceConnect = forceConnect;
    }

    public getMessagePackageName(): string {
        return 'com.clover.remote.protocol.websocket';
    }

    public getName(): string {
        return 'Clover Cloud WebSocket Connector';
    }

    public getCloverDeviceType(): any {
        return WebsocketCloudCloverDevice;
    }

    public getCloverTransport(): CloverTransport {
        // this is where we determine more about the transport...
        // The connection is paired:
        let transport = new WebSocketCloudCloverTransport(
            this.reconnectDelay,
            this.webSocketImplClass,
            this.cloverServer,
            this.merchantId,
            this.accessToken,
            this.deviceId,
            this.friendlyId,
            this.forceConnect,
            this.httpSupport
        );
        return transport;
    }
}

export class WebSocketCloudCloverDeviceConfigurationBuilder  {

    private readonly applicationId: string;
    private readonly deviceId: string;
    private readonly merchantId: string;
    private readonly accessToken: string;

    private cloverServer: string;
    private httpSupport: HttpSupport;

    private webSocketFactoryFunction: any;
    private imageUtil: IImageUtil;
    private friendlyId: string;
    private forceConnect: boolean = false;
    private heartbeatInterval: number;
    private heartbeatDisconnectTimeout:number;
    private reconnectDelay: number;

    /**
     *
     * @param {string} applicationId - the applicationId that uniquely identifies the POS.
     *    e.g. com.company.MyPOS:2.3.1 for the first connection
     * @param {string} deviceId - the id (not uuid) of the device to connect to
     * @param {string} merchantId - the merchant the device belongs to.
     * @param {string} accessToken - the OAuth access token that will be used when contacting the clover server
     */
    constructor(applicationId: string, deviceId: string, merchantId: string, accessToken: string) {
        this.applicationId = applicationId;
        this.deviceId = deviceId;
        this.merchantId = merchantId;
        this.accessToken = accessToken;
        this.imageUtil = new ImageUtil();
        this.httpSupport = typeof XMLHttpRequest !== 'undefined' ? new HttpSupport(XMLHttpRequest) : null;
        this.webSocketFactoryFunction = BrowserWebSocketImpl.createInstance;
        this.cloverServer = "https://www.clover.com/";
    }

    getApplicationId(): string {
        return this.applicationId;
    }

    getDeviceId(): string {
        return this.deviceId;
    }

    getMerchantId(): string {
        return this.merchantId;
    }

    getAccessToken(): string {
        return this.accessToken;
    }

    getCloverServer(): string {
        return this.cloverServer;
    }

    setCloverServer(value: string): WebSocketCloudCloverDeviceConfigurationBuilder {
        this.cloverServer = value;
        return this;
    }

    getHttpSupport(): HttpSupport {
        return this.httpSupport;
    }

    setHttpSupport(value: HttpSupport): WebSocketCloudCloverDeviceConfigurationBuilder {
        this.httpSupport = value;
        return this;
    }

    getWebSocketFactoryFunction(): any {
        return this.webSocketFactoryFunction;
    }

    setWebSocketFactoryFunction(value: any): WebSocketCloudCloverDeviceConfigurationBuilder {
        this.webSocketFactoryFunction = value;
        return this;
    }

    getImageUtil(): IImageUtil {
        return this.imageUtil;
    }

    setImageUtil(value: IImageUtil): WebSocketCloudCloverDeviceConfigurationBuilder {
        this.imageUtil = value;
        return this;
    }

    getFriendlyId(): string {
        return this.friendlyId;
    }

    setFriendlyId(value: string): WebSocketCloudCloverDeviceConfigurationBuilder {
        this.friendlyId = value;
        return this;
    }

    getForceConnect(): boolean {
        return this.forceConnect;
    }

    setForceConnect(value: boolean): WebSocketCloudCloverDeviceConfigurationBuilder {
        this.forceConnect = value;
        return this;
    }

    getHeartbeatInterval(): number {
        return this.heartbeatInterval;
    }

    setHeartbeatInterval(value: number): WebSocketCloudCloverDeviceConfigurationBuilder {
        this.heartbeatInterval = value;
        return this;
    }

    getHeartbeatDisconnectTimeout(): number {
        return this.heartbeatDisconnectTimeout;
    }

    setHeartbeatDisconnectTimeout(value: number): WebSocketCloudCloverDeviceConfigurationBuilder {
        this.heartbeatDisconnectTimeout = value;
        return this;
    }

    getReconnectDelay(): number {
        return this.reconnectDelay;
    }

    setReconnectDelay(value: number): WebSocketCloudCloverDeviceConfigurationBuilder {
        this.reconnectDelay = value;
        return this;
    }

    build(): WebSocketCloudCloverDeviceConfiguration {
        return new WebSocketCloudCloverDeviceConfiguration(
            this.applicationId,
            this.webSocketFactoryFunction,
            this.imageUtil,
            this.cloverServer,
            this.accessToken,
            this.httpSupport,
            this.merchantId,
            this.deviceId,
            this.friendlyId,
            this.forceConnect,
            this.heartbeatInterval,
            this.reconnectDelay,
            this.heartbeatDisconnectTimeout);
    }

}
