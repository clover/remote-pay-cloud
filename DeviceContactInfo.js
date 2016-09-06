var Class = require("./Class.js");

/**
 * @constructor
 */
DeviceContactInfo = Class.create( {
    /**
     * Initialize the values for this.
     * @private
     */
    initialize: function (deviceId, isSilent) {
        this.deviceId = deviceId;
        this.isSilent = isSilent
    }
});

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = DeviceContactInfo;
}
