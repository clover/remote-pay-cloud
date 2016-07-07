module.exports.device = device;
function device() {}

device.BuildType = require("./BuildType");
device.Device = require("./Device");
device.DeviceProvision = require("./DeviceProvision");
device.DeviceProvisionState = require("./DeviceProvisionState");
device.Rom = require("./Rom");
device.RomBuildType = require("./RomBuildType");
device.SwapRequestEvent = require("./SwapRequestEvent");
device.index = require("./index.js");
//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = device;
}