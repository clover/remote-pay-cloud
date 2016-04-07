module.exports.CloverLib = CloverLib;

function CloverLib() {}
CloverLib.Clover = require("./Clover.js");
CloverLib.CloverOAuth = require("./CloverOAuth.js");
CloverLib.CloverError = require("./CloverError.js");
CloverLib.CardEntryMethods = require("./CardEntryMethods.js");
CloverLib.WebSocketDevice = require("./WebSocketDevice.js");
CloverLib.RemoteMessageBuilder = require("./RemoteMessageBuilder.js");
CloverLib.LanMethod = require("./LanMethod.js");
CloverLib.XmlHttpSupport = require("./xmlHttpSupport.js");
CloverLib.Endpoints = require("./Endpoints.js");
CloverLib.CloverID = require("./CloverID.js");
CloverLib.KeyPress = require("./KeyPress.js");
CloverLib.VoidReason = require("./VoidReason.js");
CloverLib.CookiePersistance = require("./CookiePersistance.js");

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = CloverLib;
}

