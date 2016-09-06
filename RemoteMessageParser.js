
var sdk = require("remote-pay-cloud-api");
var remotemessage = sdk.remotemessage;

var JSONToCustomObject = require("./JSONToCustomObject");

var RemoteMessageParser = function (configuration) {
    JSONToCustomObject.call(this);
    this[RemoteMessageParser.KEY_Package] = configuration[RemoteMessageParser.KEY_Package];
};

RemoteMessageParser.prototype = Object.create(JSONToCustomObject.prototype);
RemoteMessageParser.prototype.constructor = RemoteMessageParser;

/**
 *
 * @param {String} remoteMessage - a json message.  This is a remoteMessage object
 *  that is serialized to json.
 * @return a protocol message object, or just the payload if the protocol message is not recognized.
 */
RemoteMessageParser.prototype.parseMessage = function(remoteMessage, messageToPopulate, attachUnknownProperties) {
    var remoteMessageObj = new remotemessage.RemoteMessage();
    this.transfertoObject(remoteMessage, remoteMessageObj);

    // New we need to figure out what the message is so we can deserialize
    // the payload correctly
    if (remoteMessageObj.getType() === RemoteMessageType.COMMAND) {
        if (this[RemoteMessageParser.KEY_Package] === remoteMessageObj.packageName) {
            // Ok, its valid.
        }
    }
    if(remoteMessageObj.getPayload()) {
        // Older versions of the remote-pay lib did not return a body here
        var payload = JSON.parse(remoteMessageObj.getPayload());
        var copied = this.transfertoObject(payload, messageToPopulate, attachUnknownProperties);
        if (copied) {
            return copied;
        }
    }
    return messageToPopulate;
};

RemoteMessageParser.KEY_Package = "code_package";

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = RemoteMessageParser;
}

