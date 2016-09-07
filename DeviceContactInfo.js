/**
 * @constructor
 */
DeviceContactInfo = function(deviceId, isSilent) {
        this.deviceId = deviceId;
        this.isSilent = isSilent
};

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = DeviceContactInfo;
}