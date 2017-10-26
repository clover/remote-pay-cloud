import http = require('http');

import {HttpSupport} from '../../../../util/HttpSupport';
import {Endpoints} from '../../../../util/Endpoints';
import {DeviceContactInfo} from '../../../../util/DeviceContactInfo';

import {WebSocketState} from '../../../../websocket/WebSocketState';
import {CloverWebSocketClient} from './CloverWebSocketClient';

import {WebSocketCloverTransport} from "./WebSocketCloverTransport";

/**
 * WebSocket Cloud Clover Transport.  This handles the need to notify the device before a connection attempt is made.
 *
 */
export class WebSocketCloudCloverTransport extends WebSocketCloverTransport {

    /**
     * HTTP Header key that helps identify the connected client.  Typically set to the
     * 'friendlyId'.
     *
     * @type {string}
     */
    static X_CLOVER_CONNECTED_ID: string = "X-CLOVER-CONNECTED-ID";

    private httpSupport: HttpSupport;
    private cloverServer: string;
    private merchantId: string;
    private accessToken: string;
    private deviceId: string;
    private friendlyId: string;
    private forceConnect: boolean;

    /**
     * @param {number} heartbeatInterval - duration to wait for a PING before disconnecting
     * @param {number} reconnectDelay - duration to wait until a reconnect is attempted
     * @param retriesUntilDisconnect - unused
     * @param {Object} webSocketImplClass - the function that will return an instance of the
     *  CloverWebSocketInterface that will be used when connecting.  For Browser implementations, this can be
     * @param {string} cloverServer the base url for the clover server used in the cloud connection.
     *    EX:  https://www.clover.com, http://localhost:9000
     * @param {string} merchantId - the merchant the device belongs to.
     * @param {string} accessToken - the OAuth access token that will be used when contacting the clover server
     * @param {string} deviceId - the id (not uuid) of the device to connect to
     * @param {string} friendlyId - an identifier for the specific terminal connected to this device.  This id is used
     *  in debugging and may be sent to other clients if they attempt to connect to the same device.  It will also be
     *  sent to other clients that are currently connected if this device does a forceConnect.
     * @param {boolean} forceConnect - if true, overtake any existing connection.
     * @param {HttpSupport} httpSupport - the helper object used when making http requests.
     */
    public constructor(heartbeatInterval: number,
                       reconnectDelay: number,
                       retriesUntilDisconnect: number,
                       webSocketImplClass: any,
                       cloverServer: string,
                       merchantId: string,
                       accessToken: string,
                       deviceId: string,
                       friendlyId: string,
                       forceConnect: boolean,
                       httpSupport: HttpSupport) {
        super(heartbeatInterval, reconnectDelay, retriesUntilDisconnect, webSocketImplClass);
        this.cloverServer = cloverServer;
        this.merchantId = merchantId;
        this.accessToken = accessToken;
        this.deviceId = deviceId;
        this.httpSupport = httpSupport;
        this.friendlyId = friendlyId;
        this.forceConnect = forceConnect;

        this.initialize();
    }

    /**
     * The cloud needs to call an endpoint on the server to notify the device that it wants
     * to talk.  This requires a valid OAuth access token, and we also need to know which Clover
     * server to contact.
     *
     * To make the call, we also need to have an object that we can use that does not tie us to
     * a particular environment.  This is the httpSupport.
     *
     * If an attempt is being made to reconnect, when this fails, it will set the 'reconnecting' flag to
     * false to allow another reconnect attempt to be started by a separate 'thread'.
     */
    protected initialize(): void {
        // Do the notification call.  This needs to happen every time we attempt to connect.
        // It COULD mean that the device gets a notification when the Cloud Pay Display is
        // already running, but this is not harmful.
        let alertEndpoint: string = Endpoints.getAlertDeviceEndpoint(this.cloverServer, this.merchantId, this.accessToken);
        let deviceContactInfo: DeviceContactInfo = new DeviceContactInfo(this.deviceId.replace(/-/g, ""), true);
        this.httpSupport.postData(alertEndpoint,
            (data) => this.deviceNotificationSent(data),
            (error) => {
                this.connectionError(this.cloverWebSocketClient, `Error sending alert to device. Details: ${error.message}`);
                // This may end a reconnect attempt
                this.setReconnecting(false);
            },
            deviceContactInfo);
    }

    /**
     * This handles the response from the server of the request to send a notification to the device. If the
     * notification was successful, then an OPTIONS call is made using the information provided.
     *
     * @param notificationResponse - has a boolean property for 'sent', that indicates if the notification
     *  was sent to the device.  If it was, then the properties 'host' and 'token' are used to derive the
     *  websocket endpoint uri.
     */
    private deviceNotificationSent(notificationResponse: any): void {
        // Note "!data.hasOwnProperty('sent')" is included to allow for
        // backwards compatibility.  If the property is NOT included, then
        // we will assume an earlier version of the protocol on the server,
        // and assume that the notification WAS SENT.
        if (!notificationResponse.hasOwnProperty('sent') || notificationResponse.sent) {
            let deviceWebSocketEndpoint: string = Endpoints.getDeviceWebSocketEndpoint(
                notificationResponse.host, notificationResponse.token, this.friendlyId, this.forceConnect);
            this.doOptionsCallToAvoid401Error(deviceWebSocketEndpoint);
        } else {
            this.connectionError(this.cloverWebSocketClient, "Could not send alert to device.");
            // This may end a reconnect attempt
            this.setReconnecting(false);
        }
    }

    /**
     * Do an OPTIONS call to the web socket endpoint (using http).  This helps with a problem where a 401
     * response came back from the websocket endpoint.
     *
     * @param deviceWebSocketEndpoint
     */
    private doOptionsCallToAvoid401Error(deviceWebSocketEndpoint: string): void {
        // A way to deal with the 401 error that
        // occurs when a websocket connection is made to the
        // server (sometimes).  Do a preliminary OPTIONS
        // request.  Although this happens regardless of if the error
        // happens, it is tremendously faster.
        var deviceWebSocketEndpointCopy = deviceWebSocketEndpoint;

        var httpUrl = null;
        if (deviceWebSocketEndpointCopy.indexOf("wss") > -1) {
            httpUrl = deviceWebSocketEndpointCopy.replace("wss", "https");
        } else {
            httpUrl = deviceWebSocketEndpointCopy.replace("ws", "http");
        }
        this.httpSupport.options(httpUrl,
            (data, xmlHttpReqImpl) => this.afterOptionsCall(deviceWebSocketEndpoint, xmlHttpReqImpl),
            (data, xmlHttpReqImpl) => this.afterOptionsCall(deviceWebSocketEndpoint, xmlHttpReqImpl));
    }

    /**
     * Handles the response to the OPTIONS call.  This helps with a 401 response, and is used to help identify
     * any existing connection to the device.
     *
     * If the endpoint is available, then the transport is connected to the websocket.
     *
     * @param deviceWebSocketEndpoint
     */
    private afterOptionsCall(deviceWebSocketEndpoint: string, xmlHttpReqImpl: any): void {
        // See com.clover.support.handler.remote_pay.RemotePayConnectionControlHandler#X_CLOVER_CONNECTED_ID
        // This checks for an existing connection, which includes the id of the terminal that is connected.
        let connectedId = "";
        if (xmlHttpReqImpl && typeof xmlHttpReqImpl["getResponseHeader"] === "function") {
            connectedId = xmlHttpReqImpl.getResponseHeader(WebSocketCloudCloverTransport.X_CLOVER_CONNECTED_ID)
        }
        if (connectedId && !this.forceConnect) {
            if (this.friendlyId == connectedId) {
                // Do anything here?  This is already connected.
                this.logger.debug("Trying to connect, but already connected to friendlyId '" + this.friendlyId + "'");
                if (this.cloverWebSocketClient) {
                    this.cloverWebSocketClient.close();
                }
            } else {
                this.connectionError(this.cloverWebSocketClient, "Device is already connected to '" + this.friendlyId + "'");
                // This may end a reconnect attempt
                this.setReconnecting(false);
                return; // done connecting
            }
            // If the device socket is already connected and good, just return.
            if (this.cloverWebSocketClient && this.cloverWebSocketClient.getWebSocketState() == WebSocketState.OPEN) {
                // This may end a reconnect attempt
                this.setReconnecting(false);
                return; // done connecting
            }
        }
        super.initializeWithUri(deviceWebSocketEndpoint);
    }

    /**
     *
     * @override
     * @param ws
     */
    public onOpen(ws: CloverWebSocketClient): void {
        if (this.cloverWebSocketClient == ws) {
            super.onOpen(ws);
            this.notifyDeviceReady();
        }
    }
}
