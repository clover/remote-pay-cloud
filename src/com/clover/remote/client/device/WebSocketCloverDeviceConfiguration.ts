import { WebSocketCloverTransport } from '../transport/websocket/WebSocketCloverTransport';
import {CloverTransport} from '../transport/CloverTransport';
import {CloverDeviceConfiguration} from './CloverDeviceConfiguration';
import {DefaultCloverDevice} from './DefaultCloverDevice';
import {PairingDeviceConfiguration} from '../transport/PairingDeviceConfiguration';

export abstract class WebSocketCloverDeviceConfiguration implements CloverDeviceConfiguration {

	protected heartbeatInterval: number = 1000;
	protected reconnectDelay: number = 3000;
	protected pingRetryCountBeforeReconnect: number = 4;
	private appId: string;
	protected webSocketImplClass: any;

	/**
	 *
	 * @param {string} endpoint - the endpoint of the Clover device. e.g. wss://192.168.1.15:12345/remote_pay
	 * @param {string} applicationId - the applicationId that uniquely identifies the POS. e.g. com.company.MyPOS:2.3.1
	 * @param {Object} webSocketFactoryFunction - the function that will return an instance of the CloverWebSocketInterface
	 * 	that will be used when connecting.
	 * @param {number} heartbeatInterval - duration to wait for a PING before disconnecting
	 * @param {number} reconnectDelay - duration to wait until a reconnect is attempted
	 */
	constructor(applicationId: string,
				webSocketFactoryFunction:any,
				heartbeatInterval?: number,
				reconnectDelay?: number) {
		this.appId = applicationId;
		this.webSocketImplClass = webSocketFactoryFunction;
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

	public getCloverDeviceType(): any {
		return DefaultCloverDevice;
	}

	public getName(): string {
		return 'Clover WebSocket Connector';
	}

	/**
	 * @override
	 */
	public abstract getMessagePackageName(): string;

	/**
	 * @override
	 */
	public abstract getCloverTransport(): CloverTransport;
}
