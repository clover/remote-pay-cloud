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
var WebSocketState_1 = require("./WebSocketState");
var Logger_1 = require("../remote/client/util/Logger");
/**
 * WebSocket Clover Interface
 *
 * Interface to connect a websocket implementation to.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 */
var CloverWebSocketInterface = (function (_super) {
    __extends(CloverWebSocketInterface, _super);
    function CloverWebSocketInterface(endpoint) {
        var _this = _super.call(this) || this;
        // Create a logger
        _this.logger = Logger_1.Logger.create();
        _this.endpoint = endpoint;
        return _this;
    }
    CloverWebSocketInterface.prototype.connect = function () {
        this.webSocket = this.createWebSocket(this.endpoint);
        this.webSocket.setOnOpen(function (event) {
            this.notifyOnOpen(event).bind(this);
        });
        this.webSocket.setOnMessage(function (event) {
            this.notifyOnClose(event).bind(this);
        });
        this.webSocket.setOnError(function (event) {
            this.notifyOnClose(event).bind(this);
        });
        this.webSocket.setOnClose(function (event) {
            this.notifyOnClose(event).bind(this);
        });
        return this;
    };
    ///////
    // https://www.w3.org/TR/2011/WD-websockets-20110419/
    CloverWebSocketInterface.prototype.notifyOnOpen = function (event) {
        var _this = this;
        this.forEach(function (listener) {
            try {
                // check event here for any additional data we can see - headers?
                listener.onConnected(_this);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverWebSocketInterface.prototype.notifyOnMessage = function (event) {
        var _this = this;
        this.forEach(function (listener) {
            try {
                listener.onTextMessage(_this, event.data);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverWebSocketInterface.prototype.notifyOnError = function (event) {
        var _this = this;
        this.forEach(function (listener) {
            try {
                /*
                According to the spec, only CLOSING or OPEN should occur. This is a 'simple' event.
                 */
                // check event here for any additional data we can see - headers?
                if (_this.webSocket.getReadyState() == WebSocketState_1.WebSocketState.CONNECTING) {
                    listener.onConnectError(_this);
                }
                else if (_this.webSocket.getReadyState() == WebSocketState_1.WebSocketState.CLOSING) {
                    listener.onUnexpectedError(_this);
                }
                else if (_this.webSocket.getReadyState() == WebSocketState_1.WebSocketState.CLOSED) {
                    listener.onDisconnected(_this);
                }
                else if (_this.webSocket.getReadyState() == WebSocketState_1.WebSocketState.OPEN) {
                    listener.onSendError(_this);
                }
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverWebSocketInterface.prototype.notifyOnClose = function (event) {
        var _this = this;
        this.forEach(function (listener) {
            try {
                listener.onCloseFrame(_this, event.code, event.reason);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    ////////
    CloverWebSocketInterface.prototype.sendClose = function () {
        this.webSocket.close();
        return this;
    };
    CloverWebSocketInterface.prototype.sendText = function (data) {
        this.webSocket.send(data);
        return this;
    };
    CloverWebSocketInterface.prototype.getState = function () {
        return this.webSocket.getReadyState();
    };
    CloverWebSocketInterface.prototype.isOpen = function () {
        return this.webSocket.getReadyState() == WebSocketState_1.WebSocketState.OPEN;
    };
    CloverWebSocketInterface.prototype.addListener = function (listener) {
        this.push(listener);
    };
    CloverWebSocketInterface.prototype.removeListener = function (listener) {
        var indexOfListener = this.indexOf(listener);
        if (indexOfListener !== -1) {
            this.splice(indexOfListener, 1);
            return true;
        }
        return false;
    };
    CloverWebSocketInterface.prototype.getListeners = function () {
        return this.slice();
    };
    return CloverWebSocketInterface;
}(Array));
exports.CloverWebSocketInterface = CloverWebSocketInterface;

//# sourceMappingURL=../../../maps/com/clover/websocket/CloverWebSocketInterface.js.map
