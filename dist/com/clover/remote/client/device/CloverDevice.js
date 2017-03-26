"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Clover Device
 *
 * Abstract clover device.
 */
var CloverDevice = (function () {
    /**
     * Constructor
     *
     * @param {string} packageName
     * @param {CloverTransport} transport
     * @param {string} applicationId
     */
    function CloverDevice(packageName, transport, applicationId) {
        this.supportsAck = false;
        this.packageName = packageName;
        this.transport = transport;
        this.applicationId = applicationId;
        this.deviceObservers = [];
        this.supportsAck = false;
    }
    /**
     * Add a new observer to the list of observers
     *
     * @param {CloverDeviceObserver} observer - observer to add
     */
    CloverDevice.prototype.subscribe = function (observer) {
        this.deviceObservers.push(observer);
    };
    /**
     * Remove an observer from the list of observers
     *
     * @param {CloverDeviceObserver} observer - observer to remove
     */
    CloverDevice.prototype.unsubscribe = function (observer) {
        var indexOfObserver = this.deviceObservers.indexOf(observer);
        if (indexOfObserver !== -1) {
            this.deviceObservers.splice(indexOfObserver, 1);
        }
    };
    /**
     * Supports Acknowledgements
     *
     * @param {boolean} supportsAck
     */
    CloverDevice.prototype.setSupportsAcks = function (supportsAck) {
        this.supportsAck = supportsAck;
    };
    /**
     * Get Supports Acknowledgements flag
     *
     * @returns boolean - Flag indicating if this device supports acks
     */
    CloverDevice.prototype.supportsAcks = function () {
        return this.supportsAck;
    };
    return CloverDevice;
}());
exports.CloverDevice = CloverDevice;

//# sourceMappingURL=../../../../../maps/com/clover/remote/client/device/CloverDevice.js.map
