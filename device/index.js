module.exports.device = device;
/**
* @namespace device
*/
function device() {}

device.BuildType = require("./BuildType");
device.Device = require("./Device");
device.DeviceProvision = require("./DeviceProvision");
device.DeviceProvisionState = require("./DeviceProvisionState");
device.Rom = require("./Rom");
device.RomBuildType = require("./RomBuildType");
device.SwapRequestEvent = require("./SwapRequestEvent.js");
//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = device;
}