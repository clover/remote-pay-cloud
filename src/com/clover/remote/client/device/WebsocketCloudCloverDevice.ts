import sdk = require('remote-pay-cloud-api');

import {CloverDeviceConfiguration} from './CloverDeviceConfiguration';
import {DefaultCloverDevice} from './DefaultCloverDevice';

export class WebsocketCloudCloverDevice extends DefaultCloverDevice {

    constructor(configuration:CloverDeviceConfiguration) {
        super(configuration);
    }

    /**
     * The cloud sends a message to the device to let it know that the client is disconnecting
     *
     * @override
     */
    public dispose(): void {
        let remoteMessage: sdk.remotemessage.RemoteMessage = this.buildRemoteMessageToSend(new sdk.remotemessage.ShutDownMessage());
        let msgId: string = remoteMessage.getId();

        // If this supports acknowledgement, then wait for the message to be acknowledged before
        // closing the websocket.  Otherwise close it immediately.
        // if (!this.supportsAcks()) {
            this.sendRemoteMessage(remoteMessage);
            super.dispose();
        //} else {
        //    this.addTaskForAck(msgId, () => {
        //        super.dispose();
        //    });
        //    this.sendRemoteMessage(remoteMessage);
        //}
    }

    private disposeWithoutMessage(): void {
        super.dispose();
    }

    /**
     * Cloud connections can be interrupted by another terminal
     *
     * @param rMessage
     */
    protected handleRemoteMessageEVENT(rMessage: sdk.remotemessage.RemoteMessage){
        let method: sdk.remotemessage.Method = sdk.remotemessage.Method[rMessage.method];
        if (method == null) {
            this.logger.error('Unsupported method type: ' + rMessage.method);
        }
        else {
            var sdkMessage:sdk.remotemessage.Message = this.messageParser.parseMessageFromRemoteMessageObj(rMessage);
            if (method == sdk.remotemessage.Method.FORCECONNECT) {
                this.logger.info("Connection was stolen!  Will not attempt reconnect.", rMessage);
                // Do we need to notify anyone?
                this.notifyObserversForceConnect(sdkMessage);
                this.disposeWithoutMessage();
            }
        }
    }

    private notifyObserversForceConnect(message: sdk.remotemessage.ForceConnectMessage): void {
        this.deviceObservers.forEach((obs) => {
            let deviceErrorEvent:sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
            deviceErrorEvent.setCode(sdk.remotepay.DeviceErrorEventCode.Interrupted);
            deviceErrorEvent.setMessage(JSON.stringify(message));
            deviceErrorEvent.setType(sdk.remotepay.ErrorType.COMMUNICATION);
            obs.onDeviceError(deviceErrorEvent);
        });
    }

    /**
     * Currently only the cloud will send this message.
     *
     * @param rMessage
     */
    protected handleRemoteMessage(rMessage: sdk.remotemessage.RemoteMessage){
        try {
            if(rMessage.method == sdk.remotemessage.Method.RESET) {
                this.logger.info("Reset requested!  Will reconnect.");
                this.transport.reset();
            } else{
                super.handleRemoteMessage(rMessage);
            }
        }
        catch(eM) {
            this.logger.error('Error processing message: ' + rMessage.payload, eM);
        }
    }
}