"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var sdk = require("remote-pay-cloud-api");
var CloverWebSocketClient_1 = require("./CloverWebSocketClient");
var CloverTransport_1 = require("../CloverTransport");
var Logger_1 = require("../../util/Logger");
/**
 * WebSocket Clover Transport
 *
 * This is a websocket implementation of the Clover Transport.
 */
var WebSocketCloverTransport = (function (_super) {
    __extends(WebSocketCloverTransport, _super);
    function WebSocketCloverTransport(endpoint, heartbeatInterval, reconnectDelay, retriesUntilDisconnect, posName, serialNumber, authToken, webSocketImplClass, friendlyId, allowOvertakeConnection) {
        var _this = 
        //public constructor(deviceConfiguration: WebSocketCloverDeviceConfiguration) {
        _super.call(this) || this;
        // Create a logger
        _this.logger = Logger_1.Logger.create();
        _this.reconnectDelay = 3000;
        _this.status = "Disconnected";
        /**
         * prevent reconnects if shutdown was requested
         */
        _this.shutdown = false;
        // KeyStore trustStore; // nope, browser handled.
        _this.isPairing = true;
        /**
         * A single thread/queue to process reconnect requests
         */
        // ScheduledThreadPoolExecutor reconnectPool = new ScheduledThreadPoolExecutor(1);
        _this.reconnector = function () {
            if (!this.shutdown) {
                try {
                    this.initialize(this.endpoint);
                }
                catch (e) {
                    this.reconnect();
                }
            }
        }.bind(_this);
        _this.endpoint = endpoint;
        // this.heartbeatInterval = Math.max(10, heartbeatInterval);
        _this.reconnectDelay = Math.max(0, reconnectDelay);
        // this.maxPingRetriesBeforeDisconnect = Math.max(0, retriesUntilDisconnect);
        _this.posName = posName;
        _this.serialNumber = serialNumber;
        _this.authToken = authToken;
        _this.webSocketImplClass = webSocketImplClass;
        _this.initialize(_this.endpoint);
        return _this;
    }
    WebSocketCloverTransport.prototype.reconnect = function () {
        if (this.shutdown) {
            this.logger.debug("Not attempting to reconnect, shutdown...");
            return;
        }
        setTimeout(this.reconnector, this.reconnectDelay);
    };
    WebSocketCloverTransport.prototype.sendMessage = function (message) {
        // let's see if we have connectivity
        if (this.webSocket != null && this.webSocket.isOpen()) {
            try {
                this.webSocket.send(message);
            }
            catch (e) {
                this.reconnect();
            }
            return 0;
        }
        else {
            this.reconnect();
        }
        return -1;
    };
    WebSocketCloverTransport.prototype.clearWebsocket = function () {
        if (this.webSocket != null) {
            this.webSocket.clearListener();
        }
        this.webSocket = null;
    };
    WebSocketCloverTransport.prototype.initialize = function (deviceEndpoint) {
        if (this.webSocket != null) {
            if (this.webSocket.isOpen() || this.webSocket.isConnecting()) {
                return;
            }
            else {
                this.clearWebsocket();
            }
        }
        this.webSocket = new CloverWebSocketClient_1.CloverWebSocketClient(deviceEndpoint, this, 5000, this.webSocketImplClass);
        this.webSocket.connect();
        this.logger.debug('connection attempt done.');
    };
    WebSocketCloverTransport.prototype.dispose = function () {
        this.shutdown = true;
        if (this.webSocket != null) {
            this.notifyDeviceDisconnected();
            try {
                this.webSocket.close();
            }
            catch (e) {
                this.logger.error('error disposing of transport.', e);
            }
        }
        this.clearWebsocket();
    };
    WebSocketCloverTransport.prototype.connectionError = function (ws) {
        this.logger.debug('Not Responding...');
        if (this.webSocket == ws) {
            for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
                var observer = _a[_i];
                this.logger.debug('onConnectionError');
                observer.onDeviceDisconnected(this);
            }
        }
        // this.reconnect();
    };
    WebSocketCloverTransport.prototype.onNotResponding = function (ws) {
        this.logger.debug('Not Responding...');
        if (this.webSocket == ws) {
            for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
                var observer = _a[_i];
                this.logger.debug('onNotResponding');
                observer.onDeviceDisconnected(this);
            }
        }
    };
    WebSocketCloverTransport.prototype.onPingResponding = function (ws) {
        this.logger.debug("Ping Responding");
        if (this.webSocket == ws) {
            for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
                var observer = _a[_i];
                this.logger.debug("onPingResponding");
                observer.onDeviceReady(this);
            }
        }
    };
    WebSocketCloverTransport.prototype.onOpen = function (ws) {
        this.logger.debug("Open...");
        if (this.webSocket == ws) {
            // notify connected
            this.notifyDeviceConnected();
            this.sendPairRequest();
        }
    };
    WebSocketCloverTransport.prototype.sendPairRequest = function () {
        this.isPairing = true;
        var prm = new sdk.remotemessage.PairingRequestMessage();
        prm.setName(this.posName);
        prm.setSerialNumber(this.serialNumber);
        prm.setApplicationName(this.posName);
        prm.setAuthenticationToken(this.authToken);
        this.objectMessageSender.sendObjectMessage(prm);
    };
    WebSocketCloverTransport.prototype.onClose = function (ws, code, reason, remote) {
        this.logger.debug("onClose: " + reason + ", remote? " + remote);
        if (this.webSocket == ws) {
            if (!this.webSocket.isClosing()) {
                this.webSocket.clearListener();
                this.webSocket.close();
            }
            this.clearWebsocket();
            for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
                var observer = _a[_i];
                this.logger.debug("onClose");
                observer.onDeviceDisconnected(this);
            }
            if (!this.shutdown) {
                this.reconnect();
            }
        }
    };
    WebSocketCloverTransport.prototype.onMessage = function (wsOrMessage, messageOnly) {
        if (typeof wsOrMessage == 'string') {
            _super.prototype.onMessage.call(this, wsOrMessage);
        }
        else {
            this.onMessage_cwscl(wsOrMessage, messageOnly);
        }
    };
    WebSocketCloverTransport.prototype.onMessage_cwscl = function (ws, message) {
        if (this.webSocket == ws) {
            if (this.isPairing) {
                var remoteMessageJson = JSON.parse(message);
                // var remoteMessage: sdk.remotemessage.Message = this.extractPayloadFromRemoteMessageJson(remoteMessageJson);
                if (sdk.remotemessage.METHOD.PAIRING_CODE.equals(remoteMessageJson.method)) {
                    this.logger.debug("Got PAIRING_CODE");
                    var pcm = JSON.parse(remoteMessageJson.payload);
                    var pairingCode = pcm.getPairingCode();
                    this.pairingDeviceConfiguration.onPairingCode(pairingCode);
                }
                else if (sdk.remotemessage.METHOD.PAIRING_RESPONSE.equals(remoteMessageJson.getMethod())) {
                    this.logger.debug("Got PAIRING_RESPONSE");
                    var response = JSON.parse(remoteMessageJson.payload);
                    if (sdk.remotemessage.PairingState.PAIRED.equals(response.pairingState) || sdk.remotemessage.PairingState.INITIAL.equals(response.pairingState)) {
                        this.logger.debug("Got PAIRED pair response");
                        this.isPairing = false;
                        this.authToken = response.authenticationToken;
                        try {
                            this.pairingDeviceConfiguration.onPairingSuccess(this.authToken);
                        }
                        catch (e) {
                            this.logger.debug("Error:" + e);
                        }
                        this.notifyDeviceReady();
                    }
                    else if (sdk.remotemessage.PairingState.FAILED.equals(remoteMessageJson.getMethod())) {
                        this.logger.debug("Got FAILED pair response");
                        this.isPairing = true;
                        this.sendPairRequest();
                    }
                }
                else if (sdk.remotemessage.METHOD.ACK != remoteMessageJson.getMethod() || sdk.remotemessage.METHOD.UI_STATE != remoteMessageJson.getMethod()) {
                    this.logger.debug("Unexpected method: '" + remoteMessageJson.getMethod() + "' while in pairing mode.");
                }
            }
            else {
                for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
                    var observer = _a[_i];
                    this.logger.debug("Got message: " + message);
                    observer.onMessage(message);
                }
            }
        }
    };
    WebSocketCloverTransport.prototype.onSendError = function (payloadText) {
        // TODO:
        /*for (let observer of this.observers) {
         CloverDeviceErrorEvent errorEvent = new CloverDeviceErrorEvent();
         }*/
    };
    WebSocketCloverTransport.prototype.setPairingDeviceConfiguration = function (pairingDeviceConfiguration) {
        this.pairingDeviceConfiguration = pairingDeviceConfiguration;
    };
    return WebSocketCloverTransport;
}(CloverTransport_1.CloverTransport));
WebSocketCloverTransport.METHOD = "method";
WebSocketCloverTransport.PAYLOAD = "payload";
exports.WebSocketCloverTransport = WebSocketCloverTransport;

//# sourceMappingURL=../../../../../../maps/com/clover/remote/client/transport/websocket/WebSocketCloverTransport.js.map
