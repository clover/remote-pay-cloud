"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Clover Transport
 *
 * The clover transport facilitates notification distribution
 * from the device to a list of observers.
 */
var CloverTransport = (function () {
    function CloverTransport() {
        // List of observers to notify
        this.observers = [];
        // Flag to determine if the device is ready
        this.ready = false;
    }
    /**
     * Notify observers that the device is connected
     */
    CloverTransport.prototype.notifyDeviceConnected = function () {
        var _this = this;
        this.observers.forEach(function (obs) {
            obs.onDeviceConnected(_this);
        });
    };
    /**
     * Notify observers that the device is ready
     */
    CloverTransport.prototype.notifyDeviceReady = function () {
        var _this = this;
        this.ready = true;
        this.observers.forEach(function (obs) {
            obs.onDeviceReady(_this);
        });
    };
    /**
     * Notify observers that the device has disconnected
     */
    CloverTransport.prototype.notifyDeviceDisconnected = function () {
        var _this = this;
        this.ready = false;
        this.observers.forEach(function (obs) {
            obs.onDeviceDisconnected(_this);
        });
    };
    /**
     * Should be called by subclasses (_super.onMessage) when a message is received
     * in order to forward to all observers
     *
     * @param {string} message - The message we received
     */
    CloverTransport.prototype.onMessage = function (message) {
        this.observers.forEach(function (obs) {
            obs.onMessage(message);
        });
    };
    /**
     * Add new observer to receive notifications from the device
     *
     * @param {CloverTransportObserver} observer - the observer to notify
     */
    CloverTransport.prototype.subscribe = function (observer) {
        var _this = this;
        if (this.ready) {
            this.observers.forEach(function (obs) {
                obs.onDeviceReady(_this);
            });
        }
        this.observers.push(observer);
    };
    /**
     * Remove an observer from the list of observers
     *
     * @param {CloverTransportObserver} observer - the observer to remove
     */
    CloverTransport.prototype.unsubscribe = function (observer) {
        var indexOfObserver = this.observers.indexOf(observer);
        if (indexOfObserver !== -1) {
            this.observers.splice(indexOfObserver, 1);
        }
    };
    /**
     * Clear the observers list
     */
    CloverTransport.prototype.clearListeners = function () {
        this.observers.splice(0, this.observers.length);
    };
    CloverTransport.prototype.setObjectMessageSender = function (objectMessageSender) {
        this.objectMessageSender = objectMessageSender;
    };
    return CloverTransport;
}());
exports.CloverTransport = CloverTransport;

//# sourceMappingURL=../../../../../maps/com/clover/remote/client/transport/CloverTransport.js.map
