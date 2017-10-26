import * as sdk from 'remote-pay-cloud-api';

import {PairingDeviceConfiguration} from '../PairingDeviceConfiguration';
import {CloverWebSocketClient} from './CloverWebSocketClient';
import {WebSocketCloverTransport} from "./WebSocketCloverTransport";

/**
 * WebSocket Paired Clover Transport
 *
 * Implements code that is used to pair with a device.  Depending on the application running on a device,
 * a pairing protocol may be needed to successfully connect.  This implementation sends the pairing request
 * when the websocket is opened.
 */
export class WebSocketPairedCloverTransport extends WebSocketCloverTransport {

    private endpoint: string
    private posName: string;
    private serialNumber: string;
    private authToken: string;
    pairingDeviceConfiguration: PairingDeviceConfiguration; // Network Pay display specific
    isPairing: boolean = true;

    public constructor(endpoint: string,
                       heartbeatInterval: number,
                       reconnectDelay: number,
                       retriesUntilDisconnect: number,
                       posName: string,
                       serialNumber: string,
                       authToken: string,
                       webSocketImplClass: any) {
        super(heartbeatInterval, reconnectDelay, retriesUntilDisconnect, webSocketImplClass);
        this.endpoint = endpoint;
        this.posName = posName;
        this.serialNumber = serialNumber;
        this.authToken = authToken;

        this.initialize();
    }

    protected initialize(): void {
        this.initializeWithUri(this.endpoint);
    }

    /**
     *
     * @override
     * @param ws
     */
    public onOpen(ws: CloverWebSocketClient): void {
        if (this.cloverWebSocketClient == ws) {
            super.onOpen(ws);
            this.sendPairRequest();
        }
    }

    private sendPairRequest(): void {
        this.isPairing = true;
        let prm: sdk.remotemessage.PairingRequestMessage = new sdk.remotemessage.PairingRequestMessage();
        prm.setName(this.posName);
        prm.setSerialNumber(this.serialNumber);
        prm.setApplicationName(this.posName);
        prm.setAuthenticationToken(this.authToken);
        this.objectMessageSender.sendObjectMessage(prm);
    }

    /**
     * Handles routing pairing messages.  Routes PAIRING_CODE and PairingResponse PAIRED/INITIAL messages to the
     * configured PairingDeviceConfiguration
     *
     * @param ws
     * @param message
     */
    public onMessage_cwscl(ws: CloverWebSocketClient, message: string): void { // CloverWebSocketClientListener
        if (this.cloverWebSocketClient == ws) {
            if (this.isPairing) {
                let remoteMessage: sdk.remotemessage.RemoteMessage = this.messageParser.parseToRemoteMessage(message);
                var sdkMessage: sdk.remotemessage.Message = this.messageParser.parseMessageFromRemoteMessageObj(remoteMessage);

                if (sdkMessage) {
                    if (sdk.remotemessage.Method.PAIRING_CODE == sdkMessage.getMethod()) {
                        this.logger.debug("Got PAIRING_CODE");
                        var pcm: sdk.remotemessage.PairingCodeMessage = <sdk.remotemessage.PairingCodeMessage> sdkMessage;
                        var pairingCode: string = pcm.getPairingCode();
                        this.pairingDeviceConfiguration.onPairingCode(pairingCode);
                    } else if (sdk.remotemessage.Method.PAIRING_RESPONSE == sdkMessage.getMethod()) {
                        this.logger.debug("Got PAIRING_RESPONSE");
                        var response: sdk.remotemessage.PairingResponseMessage = <sdk.remotemessage.PairingResponseMessage> sdkMessage;
                        if (sdk.remotemessage.PairingState.PAIRED == response.getPairingState() ||
                            sdk.remotemessage.PairingState.INITIAL == response.getPairingState()) {
                            this.logger.debug("Got PAIRED pair response");
                            this.isPairing = false;
                            this.authToken = response.getAuthenticationToken();

                            try {
                                this.pairingDeviceConfiguration.onPairingSuccess(this.authToken);
                            } catch (e) {
                                this.logger.debug("Error:" + e);
                            }
                            this.notifyDeviceReady();
                        } else if (sdk.remotemessage.PairingState.FAILED == response.getPairingState()) {
                            this.logger.debug("Got FAILED pair response");
                            this.isPairing = true;
                            this.sendPairRequest();
                        }
                    } else if (sdk.remotemessage.Method.ACK != sdkMessage.getMethod() || sdk.remotemessage.Method.UI_STATE != sdkMessage.getMethod()) {
                        this.logger.debug("Unexpected method: '" + sdkMessage.getMethod() + "' while in pairing mode.");
                    }
                } else {
                    this.logger.warn("Unrecognized message", message)
                }
            } else {
                super.onMessage_cwscl(ws, message);
            }
        }
    }

    public setPairingDeviceConfiguration(pairingDeviceConfiguration: PairingDeviceConfiguration): void {
        this.pairingDeviceConfiguration = pairingDeviceConfiguration;
    }

    public setAuthToken(authToken: string) {
        this.authToken = authToken;
    }
}
