import sdk = require('remote-pay-cloud-api');
import http = require('http');

import {RemoteMessageParser} from '../../../../json/RemoteMessageParser';

import {PairingDeviceConfiguration} from '../PairingDeviceConfiguration';
import {CloverDeviceConfiguration} from '../../device/CloverDeviceConfiguration';
import {CloverDevice} from '../../device/CloverDevice';
import {CloverWebSocketClient} from './CloverWebSocketClient';

import {CloverTransport} from '../CloverTransport';
import {Logger} from '../../util/Logger';
import {CloverWebSocketClientListener} from "./CloverWebSocketClientListener";
import {WebSocketCloverTransport} from "./WebSocketCloverTransport";

import {CloverTransportObserver} from '../CloverTransportObserver';
import {WebSocketCloverDeviceConfiguration} from "../../device/WebSocketCloverDeviceConfiguration";

/**
 * WebSocket Clover Transport
 * 
 * This is a websocket implementation of the Clover Transport.
 */
export class WebSocketPairedCloverTransport extends WebSocketCloverTransport {

	private endpoint:string
	private posName: string;
	private serialNumber: string;
	private authToken: string;
	pairingDeviceConfiguration: PairingDeviceConfiguration; // Network Pay display specific
	isPairing: boolean = true;

    public constructor(endpoint:string,
                       heartbeatInterval:number,
                       reconnectDelay:number,
                       retriesUntilDisconnect:number,
                       posName:string,
                       serialNumber:string,
                       authToken:string,
                       webSocketImplClass:any) {
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
		if (this.webSocket == ws) {
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

    public onMessage_cwscl(ws: CloverWebSocketClient, message: string): void { // CloverWebSocketClientListener
        if (this.webSocket == ws) {
            if(this.isPairing) {
                let remoteMessage: sdk.remotemessage.RemoteMessage = this.messageParser.parseToRemoteMessage(message);
                var sdkMessage: sdk.remotemessage.Message = this.messageParser.parseMessageFromRemoteMessageObj(remoteMessage);

				if(sdkMessage) {
					if (sdk.remotemessage.Method.PAIRING_CODE == sdkMessage.getMethod()) {
						this.logger.debug("Got PAIRING_CODE");
						var pcm:sdk.remotemessage.PairingCodeMessage = sdkMessage;
						var pairingCode:string = pcm.getPairingCode();
						this.pairingDeviceConfiguration.onPairingCode(pairingCode);
					} else if (sdk.remotemessage.Method.PAIRING_RESPONSE == sdkMessage.getMethod()) {
						this.logger.debug("Got PAIRING_RESPONSE");
						var response:sdk.remotemessage.PairingResponse = sdkMessage;
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
						} else if (sdk.remotemessage.PairingState.FAILED == sdkMessage.getMethod()) {
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
}
