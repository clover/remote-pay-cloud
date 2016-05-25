require("prototype");

var remotemessage = require("./remotemessage");

RemoteMessageParser = Class.create( JSONToCustomObject, {
    /**
     *
     */
    initialize: function (configuration) {
        this[RemoteMessageParser.KEY_Package] = configuration[RemoteMessageParser.KEY_Package];
    },

    /**
     *
     * @param {String} remoteMessage - a json message.  This is a remoteMessage object
     *  that is serialized to json.
     * @return a protocol message object, or just the payload if the protocol message is not recognized.
     */
    parseMessage: function(remoteMessage, messageToPopulate, attachUnknownProperties) {
        var remoteMessageObj = new remotemessage.RemoteMessage();
        this.transfertoObject(remoteMessage, remoteMessageObj);

        // New we need to figure out what the message is so we can deserialize
        // the payload correctly
        if (remoteMessageObj.getType() === RemoteMessageType.COMMAND) {
            if (this[RemoteMessageParser.KEY_Package] === remoteMessageObj.packageName) {
                // Ok, its valid.
            }
        }
        var payload = JSON.parse(remoteMessageObj.getPayload());
        var copied = this.transfertoObject(payload, messageToPopulate, attachUnknownProperties);
        if(copied) {
            return copied;
        }
        return messageToPopulate;
    }
});
RemoteMessageParser.KEY_Package = "code_package";

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = RemoteMessageParser;
}

