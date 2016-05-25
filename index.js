module.exports.CloverLib = CloverLib;

function CloverLib() {}
// These exports expose the beta method of using the Clover device
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
CloverLib.JSONToCustomObject = require("./JSONToCustomObject.js");
CloverLib.MethodToMessage = require("./MethodToMessage.js");

// These exports expose the v1 interface and objects.
CloverLib.base = require("./base");
CloverLib.customers = require("./customers");
CloverLib.device = require("./device");
CloverLib.hours = require("./hours");
CloverLib.inventory = require("./inventory");
CloverLib.order = require("./order");
CloverLib.payments = require("./payments");
CloverLib.base = require("./base");
CloverLib.printer = require("./printer");
CloverLib.remotepay = require("./remotepay");
CloverLib.remotemessage = require("./remotemessage");

CloverLib.CloverConnectorImpl = require("./CloverConnectorImpl.js")
CloverLib.CloverConnectorFactory = require("./CloverConnectorFactory.js")
CloverLib.DelegateCloverConnectorListener = require("./DelegateCloverConnectorListener.js")
CloverLib.DebugCloverConnectorListener = require("./DebugCloverConnectorListener.js")

CloverLib.Logger = require('./Logger.js');


//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = CloverLib;
}

