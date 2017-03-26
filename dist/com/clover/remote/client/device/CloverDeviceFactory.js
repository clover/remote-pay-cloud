"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logger_1 = require("../util/Logger");
/**
 * Clover Device Factory
 *
 * The clover device factory returns new clover devices.
 */
var CloverDeviceFactory = (function () {
    function CloverDeviceFactory() {
    }
    /**
     * Returns a new clover device based on the configuration
     *
     * @param {CloverDeviceConfiguration} configuration
     * @returns CloverDevice
     */
    CloverDeviceFactory.get = function (configuration) {
        var cloverDeviceName = configuration.getCloverDeviceTypeName();
        // Try to get the requested clover device.
        var cd = null;
        try {
            cd = require('./' + cloverDeviceName)(configuration);
        }
        catch (e) {
            Logger_1.Logger.create().error(e);
        }
        // Return the clover device or null.
        return cd;
    };
    return CloverDeviceFactory;
}());
exports.CloverDeviceFactory = CloverDeviceFactory;

//# sourceMappingURL=../../../../../maps/com/clover/remote/client/device/CloverDeviceFactory.js.map
