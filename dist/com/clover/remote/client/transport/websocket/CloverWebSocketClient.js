"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocketState_1 = require("../../../../websocket/WebSocketState");
var Logger_1 = require("../../util/Logger");
var CloverWebSocketClient = (function () {
    function CloverWebSocketClient(endpoint, listener, heartbeatInterval, webSocketImplClass) {
        this.logger = Logger_1.Logger.create();
        this.listener = listener;
        this.heartbeatInterval = heartbeatInterval >= 0 ? Math.min(100, heartbeatInterval) : heartbeatInterval; // can be negative, but > than 100 ms
        this.endpoint = endpoint;
        this.webSocketImplClass = webSocketImplClass;
    }
    CloverWebSocketClient.prototype.connect = function () {
        if (this.socket != null) {
            throw new Error("Socket already created. Must create a new CloverWebSocketClient");
        }
        try {
            // Kind of odd.  webSocketImplClass is the class definition, we are creating a new one here.
            this.socket = this.webSocketImplClass(this.endpoint);
            // socket.setAutoFlush(true);
            this.socket.addListener(this);
            this.socket.connect();
        }
        catch (e) {
            this.logger.error('connect, connectionError', e);
            this.listener.connectionError(this);
        }
    };
    CloverWebSocketClient.prototype.close = function () {
        this.socket.sendClose();
    };
    CloverWebSocketClient.prototype.isConnecting = function () {
        return this.socket.getState() == WebSocketState_1.WebSocketState.CONNECTING;
    };
    CloverWebSocketClient.prototype.isOpen = function () {
        return this.socket.isOpen();
    };
    CloverWebSocketClient.prototype.isClosing = function () {
        return this.socket.getState() == WebSocketState_1.WebSocketState.CLOSING;
    };
    CloverWebSocketClient.prototype.onTextMessage = function (websocket, text) {
        this.listener.onMessage(this, text);
    };
    CloverWebSocketClient.prototype.onConnected = function (websocket) {
        this.listener.onOpen(this);
    };
    CloverWebSocketClient.prototype.onConnectError = function (websocket) {
        this.logger.error('onConnectError');
        this.listener.connectionError(this);
    };
    CloverWebSocketClient.prototype.onDisconnected = function (websocket) {
        this.listener.onClose(this, 1000, "", false);
    };
    CloverWebSocketClient.prototype.onCloseFrame = function (websocket, closeCode, reason) {
        this.listener.onClose(this, closeCode, reason, true);
    };
    CloverWebSocketClient.prototype.onError = function (websocket) {
    };
    CloverWebSocketClient.prototype.onPingFrame = function (websocket) {
        this.socket.sendPong();
    };
    CloverWebSocketClient.prototype.onSendError = function (websocket) {
        this.listener.onSendError(""); //frame.getPayloadText());
    };
    CloverWebSocketClient.prototype.onUnexpectedError = function (websocket) {
    };
    CloverWebSocketClient.prototype.send = function (message) {
        this.socket.sendText(message);
    };
    CloverWebSocketClient.prototype.clearListener = function () {
        this.socket.removeListener(this);
    };
    CloverWebSocketClient.prototype.setNotifyClose = function (b) {
        this.notifyClose = b;
    };
    CloverWebSocketClient.prototype.shouldNotifyClose = function () {
        return this.notifyClose;
    };
    return CloverWebSocketClient;
}());
exports.CloverWebSocketClient = CloverWebSocketClient;

//# sourceMappingURL=../../../../../../maps/com/clover/remote/client/transport/websocket/CloverWebSocketClient.js.map
