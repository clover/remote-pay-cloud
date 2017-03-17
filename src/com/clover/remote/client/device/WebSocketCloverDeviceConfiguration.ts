import { WebSocketCloverTransport } from '../transport/websocket/WebSocketCloverTransport';
import {CloverTransport} from '../transport/CloverTransport';
import {CloverDeviceConfiguration} from './CloverDeviceConfiguration';

export abstract class WebSocketCloverDeviceConfiguration implements CloverDeviceConfiguration {
	private posName: string;
	private serialNumber: string;
	private authToken: string;
	private uri: string = null;
	private heartbeatInterval: number = 1000;
	private reconnectDelay: number = 3000;
	private pingRetryCountBeforeReconnect: number = 4;
	private appId: string;
	private webSocketImplClass: any;

	/**
	 *
	 * @param {string} endpoint - the endpoint of the Clover device. e.g. wss://192.168.1.15:12345/remote_pay
	 * @param {string} applicationId - the applicationId that uniquely identifies the POS. e.g. com.company.MyPOS:2.3.1
	 * @param {string} posName - Displayed during pairing to display the POS name on the Mini. e.g. MyPOS
	 * @param {string} serialNumber - Displayed during pairing to display the device identifier. e.g. 'Aisle 3' or 'POS-35153234'
	 * @param {string} authToken - The authToken retrieved from a previous pairing activity, passed as an argument to onPairingSuccess. This will be null for the first connection
	 * @param {Object} webSocketImplClass - the definition of the WebSocketInterface that will be used when connecting.
	 * @param {number} heartbeatInterval - duration to wait for a PING before disconnecting
	 * @param {number} reconnectDelay - duration to wait until a reconnect is attempted
	 */
	constructor(endpoint: string, applicationId: string, posName: string, serialNumber: string, authToken: string, webSocketImplClass:any, heartbeatInterval?: number, reconnectDelay?: number) {
		this.uri = endpoint;
		this.appId = applicationId;
		this.posName = posName;
		this.serialNumber = serialNumber;
		this.authToken = authToken;
		this.webSocketImplClass = webSocketImplClass;
		if (heartbeatInterval) this.heartbeatInterval = Math.max(100, heartbeatInterval);
		if (reconnectDelay) this.reconnectDelay = Math.max(100, reconnectDelay);
	}

	public getApplicationId(): string {
		return this.appId;
	}

	public getHeartbeatInterval(): number {
		return this.heartbeatInterval;
	}

	public setHeartbeatInterval(heartbeatInterval: number): void {
		this.heartbeatInterval = heartbeatInterval;
	}

	public getReconnectDelay(): number {
		return this.reconnectDelay;
	}

	public setReconnectDelay(reconnectDelay: number): void {
		this.reconnectDelay = reconnectDelay;
	}

	public getPingRetryCountBeforeReconnect(): number {
		return this.pingRetryCountBeforeReconnect;
	}

	public setPingRetryCountBeforeReconnect(pingRetryCountBeforeReconnect: number): void {
		this.pingRetryCountBeforeReconnect = pingRetryCountBeforeReconnect;
	}

	public getCloverDeviceTypeName(): string {
		return 'DefaultCloverDevice';
	}

	public getMessagePackageName(): string {
		return 'com.clover.remote_protocol_broadcast.app';
	}

	public getName(): string {
		return 'Clover Secure WebSocket Connector';
	}

	public getCloverTransport(): CloverTransport {
		return new WebSocketCloverTransport(
			this.uri,
			this.heartbeatInterval,
			this.reconnectDelay,
			this.pingRetryCountBeforeReconnect,
			this.posName,
			this.serialNumber,
			this.authToken,
			this.webSocketImplClass);
	}
}
