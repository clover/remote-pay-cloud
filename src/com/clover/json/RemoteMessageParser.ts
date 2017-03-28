import sdk = require('remote-pay-cloud-api');

import {MethodToMessage} from './MethodToMessage';
import {JSONToCustomObject} from './JSONToCustomObject';

export class RemoteMessageParser extends JSONToCustomObject {

    // packageName:string;
    private static INSTANCE: RemoteMessageParser = new RemoteMessageParser();

    static getDefaultInstance(): RemoteMessageParser {
        return RemoteMessageParser.INSTANCE;
    }

    public constructor(/*packageName:string*/) {
        super();
        /*this.packageName = packageName;*/
    }

    ///**
    // *
    // * @param {String} remoteMessage - a json message.  This is a remoteMessage object
    // *  that is serialized to json.
    // * @return a protocol message object, or just the payload if the protocol message is not recognized.
    // */
    //public parseMessage(remoteMessage:any, messageToPopulate:any, attachUnknownProperties:boolean):any {
    //    var remoteMessageObj = parseToRemoteMessage(remoteMessage);
    //
    //    // New we need to figure out what the message is so we can deserialize
    //    // the payload correctly
    //    /*
    //    if (remoteMessageObj.getType() === sdk.remotemessage.RemoteMessageType.COMMAND) {
    //        if (this.packageName === remoteMessageObj.packageName) {
    //            // Ok, its valid.
    //        }
    //    }
    //    */
    //    if (remoteMessageObj.getPayload()) {
    //        // Older versions of the remote-pay lib did not return a body here
    //        var payload = JSON.parse(remoteMessageObj.getPayload());
    //        var copied = this.transfertoObject(payload, messageToPopulate, attachUnknownProperties);
    //        if (copied) {
    //            return copied;
    //        }
    //    }
    //    return messageToPopulate;
    //}
    //

    /**
     *
     * @param remoteMessageObj - the sdk.remotemessage.RemoteMessage that has a payload that will be parsed to a
     * sdk.remotemessage.Message
     * @returns {sdk.remotemessage.Message}
     */
    public parseMessageFromRemoteMessageObj(remoteMessageObj:sdk.remotemessage.RemoteMessage,
                                            attachUnknownProperties:boolean = false): sdk.remotemessage.Message {
        var responseMessageType = MethodToMessage.getType(remoteMessageObj.getMethod());
        if (responseMessageType) {
            var messageToPopulate = new responseMessageType;
            if (remoteMessageObj.getPayload()) {
                // Older versions of the remote-pay lib did not return a body here
                var payload = JSON.parse(remoteMessageObj.getPayload());
                var copied = this.transfertoObject(payload, messageToPopulate, attachUnknownProperties);
                if (copied) {
                    return copied;
                }
            }
        }
        return messageToPopulate;
    }

    /**
     * @param remoteMessage - a json object that is a serialized RemoteMessage
     * @returns {sdk.remotemessage.RemoteMessage} - object populated from the input json object.
     */
    public parseToRemoteMessage(remoteMessage:any) {
        var remoteMessageObj = new sdk.remotemessage.RemoteMessage();
        this.transfertoObject(remoteMessage, remoteMessageObj, false);
        return remoteMessageObj;
    }

    ///**
    // *
    // * @param remoteMessageJson - a JsonObject that is a serialized sdk.remotemessage.RemoteMessage.  It is NOT
    // *  an instance of sdk.remotemessage.RemoteMessage, just the deserialized JsonObject that represents one.
    // * @returns {any}
    // */
    //public extractPayloadFromRemoteMessageJson(remoteMessageJson): any {
    //    // Get the sdk.remotemessage.Message type for this message
    //    var responseMessageType = MethodToMessage.getType(remoteMessageJson.method);
    //    // Create an instance of the message
    //    if(responseMessageType) {
    //        var remotemessageMessage = new responseMessageType;
    //        // Populate the message using the remoteMessageJson, which is a json object that is a
    //        // sdk.remotemessage.RemoteMessage
    //        this.messageParser.parseMessage(remoteMessageJson, remotemessageMessage, false);
    //        // remotemessageMessage is a sdk.remotemessage.Message that is populated.
    //        return remotemessageMessage;
    //    }
    //    return null;
    //}
}
