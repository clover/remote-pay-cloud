import * as sdk from 'remote-pay-cloud-api';

import {MethodToMessage} from './MethodToMessage';
import {JSONToCustomObject} from './JSONToCustomObject';

/**
 * Parses remote messages from raw json, and extracts messages from the
 * remote message payload object.
 *
 */
export class RemoteMessageParser extends JSONToCustomObject {

    // packageName:string;
    private static INSTANCE: RemoteMessageParser = new RemoteMessageParser();

    static getDefaultInstance(): RemoteMessageParser {
        return RemoteMessageParser.INSTANCE;
    }

    public constructor() {
        super();
    }

    /**
     *
     * @param remoteMessageObj - the sdk.remotemessage.RemoteMessage that has a payload that will be parsed to a
     * sdk.remotemessage.Message
     * @returns {sdk.remotemessage.Message}
     */
    public parseMessageFromRemoteMessageObj(remoteMessageObj: sdk.remotemessage.RemoteMessage,
                                            attachUnknownProperties: boolean = false): sdk.remotemessage.Message {
        const responseMessageType = MethodToMessage.getType(remoteMessageObj.getMethod());
        let messageToPopulate = null;
        if (responseMessageType) {
            messageToPopulate = new responseMessageType;
            if (remoteMessageObj.getPayload()) {
                // Older versions of the remote-pay lib did not return a body here
                const payload = JSON.parse(remoteMessageObj.getPayload());
                const copied = this.transfertoObject(payload, messageToPopulate, attachUnknownProperties);
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
    public parseToRemoteMessage(remoteMessage: any) {
        const remoteMessageObj = new sdk.remotemessage.RemoteMessage();
        this.transfertoObject(remoteMessage, remoteMessageObj, false);
        return remoteMessageObj;
    }
}
