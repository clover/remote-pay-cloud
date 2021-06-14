import {HttpSupport} from '../../../../util/HttpSupport';
import {Endpoints} from '../../../../util/Endpoints';
import {DeviceContactInfo} from '../../../../util/DeviceContactInfo';
import {Constants} from '../../../../util/Constants';

import {WebSocketState} from '../../../../websocket/WebSocketState';
import {CloverWebSocketClient} from './CloverWebSocketClient';

import {WebSocketCloverTransport} from "./WebSocketCloverTransport";
import * as sdk from "remote-pay-cloud-api";

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
    // Set by the end user, used for connection initialization, returns the proxy url and sends a notification to the
    // device to start CPD.
    private readonly cloverServer: string;
    // Set based on the return of the connection initialization request.
    private webSocketURL: string;
    private readonly merchantId: string;
    private readonly accessToken: string;
    private readonly deviceId: string;
    private readonly friendlyId: string;
    private readonly forceConnect: boolean;

    /**
     * @param {number} reconnectDelay - duration to wait until a reconnect is attempted - millis.
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
    public constructor(reconnectDelay: number,
                       webSocketImplClass: any,
                       cloverServer: string,
                       merchantId: string,
                       accessToken: string,
                       deviceId: string,
                       friendlyId: string,
                       forceConnect: boolean,
                       httpSupport: HttpSupport) {
        super(reconnectDelay, webSocketImplClass);
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
     * Calls COS's alert endpoint which:
     * Initialize the connection.
     */
    public initialize(): void {
        // If we already have the webSocketUrl initialization has already been performed.
        // Skip the call to COS and connect directly to the proxy.
        if (this.webSocketURL && this.webSocketURL.length > 0) {
            this.doOptionsCallToAvoid401Error(this.webSocketURL);
        } else {
            // DSE-272, SEMI-2021, detect IE 11.
            if (typeof window !== "undefined" && !!window["MSInputMethodContext"] && !!document["documentMode"]) {
                // We should only enter this block if the browser is IE 11.  IE 11 has issues when the first call to the
                // server is a POST (initializeWithServer).  To work-around this we make a GET request
                // See http://jonnyreeves.co.uk/2013/making-xhr-request-to-https-domains-with-winjs/ for more information.
                this.httpSupport.getData(Endpoints.getMerchantEndpoint(this.cloverServer, this.merchantId, this.accessToken),
                    (_) => this.obtainWebSocketUrlAndSendPushAlert(),
                    (error) => {
                        this.logger.warn("IE 11 - Initial GET failed.", error);
                    });
            } else {
                // We aren't using IE, make the initial POST.
                this.obtainWebSocketUrlAndSendPushAlert();
            }
        }
    }

    /**
     * Calls the COS remote_pay endpoint which:
     *
     * 1) Determines what Cloud/Support server we should open a WebSocket connection to, and returns the URL of this server
     *    in the response so we can establish a connection.  Versions of COS post SEMI-2079 deployment return a Cloud/Support
     *    server identifier in the queryString which is used by HA Proxy to connect to the correct server.
     * 2) Sends a PUSH notification to the device, to notify it what server to open a WebSocket connection to.
     *
     * To make the call, we need a valid OAuth access token and to have an AJAX implementation abstraction that does
     * not tie us to a particular environment (e.g. the SDK code can work in the browser as well as Node, etc.).
     * This abstraction is httpSupport an implementation of which can be passed in in this classes constructor.
     */
    private obtainWebSocketUrlAndSendPushAlert() {
        // Do the notification call.  This needs to happen every time we attempt to connect.
        // It COULD mean that the device gets a notification when the Cloud Pay Display is
        // already running, but this is not harmful.
        let alertEndpoint: string = Endpoints.getAlertDeviceEndpoint(this.cloverServer, this.merchantId, this.accessToken);
        let deviceContactInfo: DeviceContactInfo = new DeviceContactInfo(this.deviceId.replace(/-/g, ""), true);
        this.httpSupport.postData(alertEndpoint,
            (data) => this.deviceNotificationSent(data),
            (error) => {
                // If the error is a 404, don't attempt to reconnect.
                this.connectionError(this.cloverWebSocketClient,
                    `Error connecting to your Clover device. Details: ${error.message}`,
                    null,
                    error && error.status !== 404);
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
            this.webSocketURL = Endpoints.getDeviceWebSocketEndpoint(notificationResponse, this.friendlyId, this.forceConnect, this.merchantId, this.accessToken);
            this.doOptionsCallToAvoid401Error(this.webSocketURL);
        } else {
            this.connectionError(this.cloverWebSocketClient, "The device is unreachable or an error has occurred sending the device a notification to start/connect to Cloud Pay Display.");
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
        const deviceWebSocketEndpointCopy = deviceWebSocketEndpoint;
        let httpUrl;
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
                // Closing the websocket is critical to our reconnect and recovery logic!  A connection to the device exists on the
                // proxy with the same friendlyId as us. Generally, this means that we have lost connection and are attempting to
                // reconnect.  In these cases closing the web socket will remove the connection on the proxy and allow the next
                // connection attempt to succeed.  This could also mean that the POS is re-using the same friendlyId across POS
                // clients or that a new Clover Connector was initialized without disposing of the previous Clover Connector.
                this.logger.warn("Already connected to friendlyId '" + connectedId + ".'  This can happen if the SDK is internally trying to reconnect (in which case this is not a problem), if the same friendlyId is being used for multiple POS clients, or if you attempted to initialize a new Clover Connector without disposing of the previous Clover Connector.");
                if (this.cloverWebSocketClient) {
                    this.cloverWebSocketClient.close();
                }
            } else {
                this.connectionError(this.cloverWebSocketClient, `${Constants.device_already_connected} '${connectedId}'.`, sdk.remotepay.DeviceErrorEventCode.AccessDenied);
                return; // done connecting
            }
        }
        // If the device socket is already connected and good, just return.
        if (this.cloverWebSocketClient && this.cloverWebSocketClient.getWebSocketState() == WebSocketState.OPEN) {
            this.notifyConnectionAttemptComplete();
            return; // done connecting
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
            this.notifyReady();
        }
    }
}
