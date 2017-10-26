import * as sdk from 'remote-pay-cloud-api';

import {CloverDeviceConfiguration} from './CloverDeviceConfiguration';
import {DefaultCloverDevice} from './DefaultCloverDevice';

/**
 * Device definition that has Cloud specific implementation details.
 */
export class WebsocketCloudCloverDevice extends DefaultCloverDevice {

    constructor(configuration: CloverDeviceConfiguration) {
        super(configuration);
    }

    /**
     * The cloud sends a message to the device to let it know that the client is disconnecting
     *
     * @override
     */
    public dispose(): void {
        let remoteMessage: sdk.remotemessage.RemoteMessage = this.buildRemoteMessageToSend(new sdk.remotemessage.ShutDownMessage());
        this.sendRemoteMessage(remoteMessage);
        super.dispose();
    }

    private disposeWithoutMessage(): void {
        super.dispose();
    }

    /**
     * Cloud connections can be interrupted by another terminal.  This handles this unique case by
     * disconnecting without sending the shutdown command to the device.
     *
     * @param rMessage
     */
    protected handleRemoteMessageEVENT(rMessage: sdk.remotemessage.RemoteMessage) {
        let method: sdk.remotemessage.Method = sdk.remotemessage.Method[rMessage.getMethod()];
        if (method == null) {
            this.logger.error('Unsupported method type: ' + rMessage.getMethod());
        }
        else {
            let sdkMessage: sdk.remotemessage.Message = this.messageParser.parseMessageFromRemoteMessageObj(rMessage);
            if (method == sdk.remotemessage.Method.FORCECONNECT) {
                this.logger.info("Connection was stolen!  Will not attempt reconnect.", rMessage);
                // Do we need to notify anyone?
                this.notifyObserversForceConnect(sdkMessage);
                this.disposeWithoutMessage();
            }
        }
    }

    /**
     * Reports that this connection has been severed via a onDeviceError() notification
     * @param message
     */
    private notifyObserversForceConnect(message: sdk.remotemessage.ForceConnectMessage): void {
        this.deviceObservers.forEach((obs) => {
            let deviceErrorEvent: sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
            deviceErrorEvent.setCode(sdk.remotepay.DeviceErrorEventCode.Interrupted);
            deviceErrorEvent.setMessage(JSON.stringify(message));
            deviceErrorEvent.setType(sdk.remotepay.ErrorType.COMMUNICATION);
            obs.onDeviceError(deviceErrorEvent);
        });
    }

    /**
     * Handles the "RESET" message that originates from the server.  This message is a request that the connection be
     * severed and re-established.  This is done because open long-lived connections can cause load balancers or
     * other proxy type servers to hang when an attempt to restart them is made.
     *
     * @param rMessage
     */
    protected handleRemoteMessage(rMessage: sdk.remotemessage.RemoteMessage) {
        try {
            if (rMessage.getMethod() == sdk.remotemessage.Method.RESET) {
                this.logger.info("Reset requested!  Will reconnect.");
                this.transport.reset();
            } else {
                super.handleRemoteMessage(rMessage);
            }
        }
        catch (eM) {
            this.logger.error('Error processing message: ' + rMessage.getPayload(), eM);
        }
    }
}