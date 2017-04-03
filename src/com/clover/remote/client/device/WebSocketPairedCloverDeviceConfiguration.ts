import { WebSocketPairedCloverTransport } from '../transport/websocket/WebSocketPairedCloverTransport';
import {CloverTransport} from '../transport/CloverTransport';
import {CloverDeviceConfiguration} from './CloverDeviceConfiguration';
import {DefaultCloverDevice} from './DefaultCloverDevice';
import {PairingDeviceConfiguration} from '../transport/PairingDeviceConfiguration';
import {WebSocketCloverDeviceConfiguration} from './WebSocketCloverDeviceConfiguration';


export abstract class WebSocketPairedCloverDeviceConfiguration extends WebSocketCloverDeviceConfiguration implements PairingDeviceConfiguration {

	private uri: string = null;
	private posName: string;
	private serialNumber: string;
	private authToken: string;

	/**
	 *
	 * @param {string} endpoint - the endpoint of the Clover device. e.g. wss://192.168.1.15:12345/remote_pay
	 * @param {string} applicationId - the applicationId that uniquely identifies the POS. e.g. com.company.MyPOS:2.3.1
	 * @param {string} posName - Displayed during pairing to display the POS name on the Mini. e.g. MyPOS
	 * @param {string} serialNumber - Displayed during pairing to display the device identifier. e.g. 'Aisle 3' or 'POS-35153234'
	 * @param {string} authToken - The authToken retrieved from a previous pairing activity, passed as an argument to onPairingSuccess. This will be null for the first connection
	 * @param {Object} webSocketFactoryFunction - the function that will return an instance of the CloverWebSocketInterface
	 * 	that will be used when connecting.
	 * @param {number} heartbeatInterval - duration to wait for a PING before disconnecting
	 * @param {number} reconnectDelay - duration to wait until a reconnect is attempted
	 */
	constructor(endpoint: string,
				applicationId: string,
				posName: string,
				serialNumber: string,
				authToken: string,
				webSocketFactoryFunction:any,
				heartbeatInterval?: number,
				reconnectDelay?: number) {
		super(applicationId,
			webSocketFactoryFunction,
			heartbeatInterval,
			reconnectDelay);
		this.uri = endpoint;
		this.posName = posName;
		this.serialNumber = serialNumber;
		this.authToken = authToken;
		this.webSocketImplClass = webSocketFactoryFunction;
	}

	public getMessagePackageName(): string {
		return 'com.clover.remote_protocol_broadcast.app';
	}

	public getName(): string {
		return 'Clover Secure WebSocket Connector';
	}

	public getCloverTransport(): CloverTransport {
		// this is where we determine more about the transport...
		// The connection is paired:
		let transport = new WebSocketPairedCloverTransport(
			this.uri,
			this.heartbeatInterval,
			this.reconnectDelay,
			this.pingRetryCountBeforeReconnect,
			this.posName,
			this.serialNumber,
			this.authToken,
			this.webSocketImplClass);
		transport.setPairingDeviceConfiguration(this);
		return transport;
	}

	abstract onPairingCode(pairingCode: string): void;
	abstract onPairingSuccess(authToken: string): void;
}
