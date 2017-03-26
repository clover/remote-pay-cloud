"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocketCloverTransport_1 = require("../transport/websocket/WebSocketCloverTransport");
var WebSocketCloverDeviceConfiguration = (function () {
    /**
     *
     * @param {string} endpoint - the endpoint of the Clover device. e.g. wss://192.168.1.15:12345/remote_pay
     * @param {string} applicationId - the applicationId that uniquely identifies the POS. e.g. com.company.MyPOS:2.3.1
     * @param {string} posName - Displayed during pairing to display the POS name on the Mini. e.g. MyPOS
     * @param {string} serialNumber - Displayed during pairing to display the device identifier. e.g. 'Aisle 3' or 'POS-35153234'
     * @param {string} authToken - The authToken retrieved from a previous pairing activity, passed as an argument to onPairingSuccess. This will be null for the first connection
     * @param {Object} webSocketImplClass - the definition of the WebSocketInterface that will be used when connecting.
     * @param {number} heartbeatInterval - duration to wait for a PING before disconnecting
     * @param {number} reconnectDelay - duration to wait until a reconnect is attempted
     */
    function WebSocketCloverDeviceConfiguration(endpoint, applicationId, posName, serialNumber, authToken, webSocketImplClass, heartbeatInterval, reconnectDelay) {
        this.uri = null;
        this.heartbeatInterval = 1000;
        this.reconnectDelay = 3000;
        this.pingRetryCountBeforeReconnect = 4;
        this.uri = endpoint;
        this.appId = applicationId;
        this.posName = posName;
        this.serialNumber = serialNumber;
        this.authToken = authToken;
        this.webSocketImplClass = webSocketImplClass;
        if (heartbeatInterval)
            this.heartbeatInterval = Math.max(100, heartbeatInterval);
        if (reconnectDelay)
            this.reconnectDelay = Math.max(100, reconnectDelay);
    }
    WebSocketCloverDeviceConfiguration.prototype.getApplicationId = function () {
        return this.appId;
    };
    WebSocketCloverDeviceConfiguration.prototype.getHeartbeatInterval = function () {
        return this.heartbeatInterval;
    };
    WebSocketCloverDeviceConfiguration.prototype.setHeartbeatInterval = function (heartbeatInterval) {
        this.heartbeatInterval = heartbeatInterval;
    };
    WebSocketCloverDeviceConfiguration.prototype.getReconnectDelay = function () {
        return this.reconnectDelay;
    };
    WebSocketCloverDeviceConfiguration.prototype.setReconnectDelay = function (reconnectDelay) {
        this.reconnectDelay = reconnectDelay;
    };
    WebSocketCloverDeviceConfiguration.prototype.getPingRetryCountBeforeReconnect = function () {
        return this.pingRetryCountBeforeReconnect;
    };
    WebSocketCloverDeviceConfiguration.prototype.setPingRetryCountBeforeReconnect = function (pingRetryCountBeforeReconnect) {
        this.pingRetryCountBeforeReconnect = pingRetryCountBeforeReconnect;
    };
    WebSocketCloverDeviceConfiguration.prototype.getCloverDeviceTypeName = function () {
        return 'DefaultCloverDevice';
    };
    WebSocketCloverDeviceConfiguration.prototype.getMessagePackageName = function () {
        return 'com.clover.remote_protocol_broadcast.app';
    };
    WebSocketCloverDeviceConfiguration.prototype.getName = function () {
        return 'Clover Secure WebSocket Connector';
    };
    WebSocketCloverDeviceConfiguration.prototype.getCloverTransport = function () {
        return new WebSocketCloverTransport_1.WebSocketCloverTransport(this.uri, this.heartbeatInterval, this.reconnectDelay, this.pingRetryCountBeforeReconnect, this.posName, this.serialNumber, this.authToken, this.webSocketImplClass);
    };
    return WebSocketCloverDeviceConfiguration;
}());
exports.WebSocketCloverDeviceConfiguration = WebSocketCloverDeviceConfiguration;

//# sourceMappingURL=../../../../../maps/com/clover/remote/client/device/WebSocketCloverDeviceConfiguration.js.map
