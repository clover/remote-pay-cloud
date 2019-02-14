import {WebSocketPairedCloverTransport} from '../transport/websocket/WebSocketPairedCloverTransport';
import {CloverTransport} from '../transport/CloverTransport';
import {WebSocketCloverDeviceConfiguration} from './WebSocketCloverDeviceConfiguration';
import {IImageUtil} from '../../../util/IImageUtil';
import {ImageUtil} from "../../../util/ImageUtil";
import {BrowserWebSocketImpl} from "../../../websocket/BrowserWebSocketImpl";
import {PairingDeviceConfiguration} from '../transport/PairingDeviceConfiguration';

/**
 * This is the base class that is used when connecting directly to a device via the "Network Pay Display".
 *
 * A pairing scheme is used when connecting, so the function callbacks for when a pairing code is received,
 * and when the pairing completes must be implemented here.
 */
export class WebSocketPairedCloverDeviceConfiguration extends WebSocketCloverDeviceConfiguration implements PairingDeviceConfiguration {

    private uri: string = null;
    private posName: string;
    private serialNumber: string;
    private authToken: string;
    private onPairingCodeHandler: (pairingCode: string) => void;
    private onPairingSuccessHandler: (authToken: string) => void;

    /**
     *
     * @param {string} endpoint - the endpoint of the Clover device. e.g. wss://192.168.1.15:12345/remote_pay
     * @param {string} applicationId - the applicationId that uniquely identifies the POS. e.g. com.company.MyPOS:2.3.1
     * @param {string} posName - Displayed during pairing to display the POS name on the Mini. e.g. MyPOS
     * @param {string} serialNumber - Displayed during pairing to display the device identifier. e.g. 'Aisle 3' or 'POS-35153234'
     * @param {string} authToken - The authToken retrieved from a previous pairing activity, passed as an argument to onPairingSuccess. This will be null for the first connection.
     * @param onPairingCode - Function that will be called when a pairing code is sent.  Typically, this would be displayed to the user, and
     * they would enter this code into the device screen.
     * @param onPairingSuccess - Function that willbe called when the pairing process is complete, a authentication token is sent that be reused.
     * @param {Object} webSocketFactoryFunction - the function that will return an instance of the CloverWebSocketInterface
     *    that will be used when connecting.
     * @param {IImageUtil} imageUtil - utility to translate images into base64 strings.
     * @param {number} [heartbeatInterval] - Frequency at which we will ping the device - millis. Defaults to -1 (disabled), minimum value is 2500 millis.
     * @param {number} [reconnectDelay] - upon disconnect, duration to wait until a reconnect is attempted - millis. Defaults to 3000 (millis), minimum value is 3000 millis.
     * @param {number} [heartbeatDisconnectTimeout] - If a response to a heartbeat ping is not received within this time we will call disconnect. Defaults to 3000 (millis).
     */
    constructor(endpoint: string,
                applicationId: string,
                posName: string,
                serialNumber: string,
                authToken: string,
                onPairingCode: (pairingCode: string) => void,
                onPairingSuccess: (authToken: string) => void,
                webSocketFactoryFunction: any,
                imageUtil: IImageUtil,
                heartbeatInterval?: number,
                reconnectDelay?: number,
                heartbeatDisconnectTimeout?: number) {
        super(applicationId,
            webSocketFactoryFunction,
            imageUtil,
            heartbeatInterval,
            reconnectDelay);
        this.uri = endpoint;
        this.posName = posName;
        this.serialNumber = serialNumber;
        this.authToken = authToken;
        this.webSocketImplClass = webSocketFactoryFunction;
        this.onPairingCodeHandler = onPairingCode;
        this.onPairingSuccessHandler = onPairingSuccess;
    }

    public getMessagePackageName(): string {
        return 'com.clover.remote_protocol_broadcast.app';
    }

    public getName(): string {
        return 'Clover Secure WebSocket Connector';
    }

    public getCloverTransport(): CloverTransport {
        // this is where we determine more about the transport...
        // The connection is paired:
        let transport = new WebSocketPairedCloverTransport(
            this.uri,
            this.reconnectDelay,
            this.posName,
            this.serialNumber,
            this.authToken,
            this.webSocketImplClass);
        transport.setPairingDeviceConfiguration(this);
        return transport;
    }

    public setAuthToken(authToken: string) {
        this.authToken = authToken;
    }

    onPairingCode(pairingCode: string): void {
        this.onPairingCodeHandler(pairingCode);
    }

    onPairingSuccess(authToken: string): void {
        this.onPairingSuccessHandler(authToken);
    }
}

export class WebSocketPairedCloverDeviceConfigurationBuilder  {

    private readonly applicationId: string;
    private readonly uri: string = null;
    private readonly serialNumber: string;
    private readonly authToken: string;
    private readonly onPairingCodeHandler: (pairingCode: string) => void;
    private readonly onPairingSuccessHandler: (authToken: string) => void;

    private webSocketFactoryFunction: any;
    private imageUtil: IImageUtil;
    private posName: string;
    private heartbeatInterval: number;
    private heartbeatDisconnectTimeout:number;
    private reconnectDelay: number;

    /**
     * @param {string} applicationId - the applicationId that uniquely identifies the POS. e.g. com.company.MyPOS:2.3.1
     * @param {string} uri - the endpoint of the Clover device. e.g. wss://192.168.1.15:12345/remote_pay
     * @param {string} posName - Displayed during pairing to display the POS name on the Mini. e.g. MyPOS
     * @param {string} serialNumber - Displayed during pairing to display the device identifier. e.g. 'Aisle 3' or 'POS-35153234'
     * @param {string} authToken - The authToken retrieved from a previous pairing activity, passed as an argument to onPairingSuccess. This will be null for the first connection
     * @param onPairingCode - Function that will be called when a pairing code is sent.  Typically, this would be displayed to the user, and
     * they would enter this code into the device screen.
     * @param onPairingSuccess - Function that will be called when the pairing process is complete, a authentication token is sent that be reused.
     */
    constructor(applicationId: string, uri: string, posName: string, serialNumber: string, authToken: string, onPairingCode: (pairingCode: string) => void, onPairingSuccess: (authToken: string) => void) {
        this.applicationId = applicationId;
        this.uri = uri;
        this.posName = posName;
        this.serialNumber = serialNumber;
        this.authToken = authToken;
        this.imageUtil = new ImageUtil();
        this.webSocketFactoryFunction = BrowserWebSocketImpl.createInstance;
        this.onPairingCodeHandler = onPairingCode;
        this.onPairingSuccessHandler = onPairingSuccess;
    }

    getApplicationId(): string {
        return this.applicationId;
    }

    getUri(): string {
        return this.uri;
    }

    getSerialNumber(): string {
        return this.serialNumber;
    }

    getAuthToken(): string {
        return this.authToken;
    }

    getWebSocketFactoryFunction(): any {
        return this.webSocketFactoryFunction;
    }

    setWebSocketFactoryFunction(value: any): WebSocketPairedCloverDeviceConfigurationBuilder {
        this.webSocketFactoryFunction = value;
        return this;
    }

    getImageUtil(): IImageUtil {
        return this.imageUtil;
    }

    setImageUtil(value: IImageUtil): WebSocketPairedCloverDeviceConfigurationBuilder {
        this.imageUtil = value;
        return this;
    }

    getPosName(): string {
        return this.posName;
    }

    setPosName(value: string): WebSocketPairedCloverDeviceConfigurationBuilder {
        this.posName = value;
        return this;
    }

    getHeartbeatInterval(): number {
        return this.heartbeatInterval;
    }

    setHeartbeatInterval(value: number): WebSocketPairedCloverDeviceConfigurationBuilder {
        this.heartbeatInterval = value;
        return this;
    }

    getHeartbeatDisconnectTimeout(): number {
        return this.heartbeatDisconnectTimeout;
    }

    setHeartbeatDisconnectTimeout(value: number): WebSocketPairedCloverDeviceConfigurationBuilder {
        this.heartbeatDisconnectTimeout = value;
        return this;
    }

    getReconnectDelay(): number {
        return this.reconnectDelay;
    }

    setReconnectDelay(value: number): WebSocketPairedCloverDeviceConfigurationBuilder {
        this.reconnectDelay = value;
        return this;
    }

    build(): WebSocketPairedCloverDeviceConfiguration {
        return new WebSocketPairedCloverDeviceConfiguration(
            this.uri,
            this.applicationId,
            this.posName,
            this.serialNumber,
            this.authToken,
            this.onPairingCodeHandler,
            this.onPairingSuccessHandler,
            this.webSocketFactoryFunction,
            this.imageUtil,
            this.heartbeatInterval,
            this.reconnectDelay,
            this.heartbeatDisconnectTimeout);
    }

}
