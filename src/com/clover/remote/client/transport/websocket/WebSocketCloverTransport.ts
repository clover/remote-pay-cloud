import CloverID = require('../../../../../../../CloverID');
import {CloverTransport} from '../CloverTransport.js';
import {Logger} from '../../util/Logger';
import {WebSocketCloverInterface} from './WebSocketCloverInterface';
import http = require('http');

/**
 * WebSocket Clover Transport
 * 
 * This is a websocket implementation of the Clover Transport.
 */
export class WebSocketCloverTransport extends CloverTransport {
	// Store the path for websocket calls
	public static WEBSOCKET_PATH: string = "/support/remote_pay/cs";

	// Create a logger
	private logger: Logger = Logger.create();

	// Websocket config values
	private endpoint: string;
	private heartbeatInterval: number;
	private reconnectDelay: number;
	private retriesUntilDisconnect: number;
	private posName: string;
	private serialNumber: string;
	private authToken: string;
	private allowOvertakeConnection: boolean;
	private friendlyId: string;

	// The websocket we will use
	// TODO: Create a custom websocket interface here
	private webSocket: WebSocketCloverInterface;

	// Flag to indicate if we are shutting down
	private shutdown: boolean = false;

	// Hold the reconnect timer
	private reconnectTimer: NodeJS.Timer;

	/**
	 * @param {WebSocketCloverInterface} webSocket 
	 */
	constructor(webSocket: WebSocketCloverInterface);
	/**
	 * @param {string} endpoint 
	 * @param {number} heartbeatInterval 
	 * @param {number} reconnectDelay 
	 * @param {number} retriesUntilDisconnect 
	 * @param {string} posName 
	 * @param {string} serialNumber 
	 * @param {string} authToken 
	 */
	constructor(endpoint: string, heartbeatInterval: number, reconnectDelay: number, retriesUntilDisconnect: number, posName: string, serialNumber: string, authToken: string, friendlyId?: string, allowOvertakeConnection?: boolean);
	constructor(endpointOrWebSocket: any, heartbeatInterval?: number, reconnectDelay?: number, retriesUntilDisconnect?: number, posName?: string, serialNumber?: string, authToken?: string, friendlyId?: string, allowOvertakeConnection?: boolean) {
		super();
		if (typeof endpointOrWebSocket == 'string') {
			// Fill in the websocket config values
			this.endpoint = endpointOrWebSocket;
			this.heartbeatInterval = Math.max(10, heartbeatInterval);
			this.reconnectDelay = Math.max(0, reconnectDelay);
			this.retriesUntilDisconnect = Math.max(0, retriesUntilDisconnect);
			this.posName = posName;
			this.serialNumber = serialNumber;
			this.authToken = authToken;
			this.allowOvertakeConnection = allowOvertakeConnection;
			this.friendlyId = new CloverID().getNewId();
			if (friendlyId !== null) {
				this.friendlyId = friendlyId;
			}

			// Initialize the websocket
			this.initialize(endpointOrWebSocket);
		}
		else {
			// Use the websocket that was passed in.
			this.webSocket = endpointOrWebSocket;
			this.sendOptionRequest(this.webSocket.getEndpoint(), (res) => {
				this.logger.info(res);
				this.webSocket.onOpen = this.onOpen;
				this.webSocket.onMessage = this.onMessage;
				this.webSocket.onError = this.onError;
				this.webSocket.onClose = this.onClose;
			});
		}
	}

	/**
	 * Initialize the websocket from an endpoint string
	 * 
	 * @param {string} endpoint - the endpoint for the websocket to connect to
	 */
	private initialize(endpoint: string): void {
		// Check to see if we have a websocket already
		if (this.webSocket !== null) {
			// Check to see if the websocket is open or connecting
			if (this.webSocket.isOpen() || this.webSocket.isConnecting()) {
				// Just wait for it to connect
				return;
			}
			else {
				// Clear the websocket listeners
				this.clearWebSocket();
			}
		}

		// Send the option request and then initialize the websocket
		this.sendOptionRequest(endpoint, (res) => {
			this.logger.info(res);
			// Create a new websocket
			// TODO: this may not be applicable here
			// this.webSocket = new WebSocketClient(endpoint);
			// this.webSocket.onOpen = this.onOpen;
			// this.webSocket.onMessage = this.onMessage;
			// this.webSocket.onError = this.onError;
			// this.webSocket.onClose = this.onClose;
		});
	}

	/**
	 * Send an OPTION request to the endpoint first to get
	 * the required X-CLOVER-CONNECTED-ID header value.
	 * 
	 * @param endpoint 
	 * @param callback 
	 */
	private sendOptionRequest(endpoint: string, callback: Function): void {
		// Update the base address for a request call
		let baseAddress = this.generateAddress(endpoint);
		var httpUrl = null;
		var proto = null;
		if (baseAddress.indexOf("wss") > -1) {
			httpUrl = baseAddress.replace('wss://', '');
			proto = 'https';
		} else {
			httpUrl = baseAddress.replace('ws://', '');
			proto = 'http';
		}
		httpUrl = httpUrl.substr(0, httpUrl.indexOf('/'));

		// Make a request to the server first
		let serverOptions = {
			protocol: proto,
			host: httpUrl,
			path: WebSocketCloverTransport.WEBSOCKET_PATH,
			method: 'OPTION'
		};
		this.logger.info('Calling: ' + httpUrl);
		http.request(serverOptions, (res) => {
			callback.call(res);
		});
	}

	/**
	 * Add the friendly name and connect settings to the endpoint
	 * 
	 * @param baseAddress 
	 */
	private generateAddress(baseAddress: string): string {
        var connect = "?";
        if (baseAddress.indexOf("?") > -1){
            connect = "&";
        }
        var generatedAddress = baseAddress + connect + "friendlyId=" + this.friendlyId;
        if (this.allowOvertakeConnection) {
            generatedAddress = generatedAddress + connect + "forceConnect=true";
        } else {
            generatedAddress = generatedAddress + connect + "forceConnect=false";
        }
		return generatedAddress;
	}

	/**
	 * Clear the websocket listeners
	 */
	private clearWebSocket(): void {
		// Check to see if the websocket exists
		if (this.webSocket !== null) {
			// Clear the listeners
			// TODO: Do we need to do this?
		}

		this.webSocket = null;
	}

	/**
	 * Send a message across the websocket
	 * 
	 * @override
	 * @param {string} message - the message to send
	 * @returns number - indicating success or failure
	 */
	public sendMessage(message: string): number {
		// Make sure we have a connection
		if (this.webSocket !== null && this.webSocket.isOpen()) {
			try {
				// Send the message
				this.webSocket.send(message);

				// Return success
				return 0;
			}
			catch(e) {
				// Reconnect
				this.reconnect();
			}
		}
		else {
			// Reconnect
			this.reconnect();
		}

		// Return failure
		return -1;
	}

	/**
	 * Try to reconnect the websocket to the endpoint
	 */
	public reconnect(): void {
		// Make sure we are not trying to shutdown first
		if (this.shutdown) {
			// Shutting down. Don't reconnect
			this.logger.debug('Not attempting to reconnect, shutdown...');
			return;
		}

		// Try to reconnect the websocket
		this.reconnectTimer = this.reconnectTimer || setTimeout(() => {
			this.initialize(this.endpoint);
		}, this.reconnectDelay);
	}

	/**
	 * Websocket connection is open
	 * 
	 * @param {any} event
	 */
	public onOpen(event: any): void {
		// Let the observers know that we are connected
		this.logger.debug('WebSocket Connection Open...');
		this.notifyDeviceConnected();
	}

	/**
	 * Websocket received message
	 * 
	 * @param {any} event
	 */
	public onMessage(event: any): void {
		super.onMessage(event.toString());
	}

	/**
	 * Websocket error occurred
	 * 
	 * @param {any} event 
	 */
	public onError(event: any): void {
		// Let the observers know that we are no longer connected
		this.notifyDeviceDisconnected();

		// Try to reconnect
		this.reconnect();
	}

	/**
	 * Websocket connection is closed
	 * 
	 * @param {any} event
	 */
	public onClose(event: any): void {
		// Let the observers know that we are no longer connected
		this.logger.debug('WebSocket Connection Closed...');
		this.notifyDeviceDisconnected();
		this.clearWebSocket();

		// Check to see if we can reconnect
		if (!this.shutdown) {
			this.reconnect();
		}
	}

	/**
	 * Clean up and dispose
	 */
	public dispose(): void {
		// Set the shutdown flag
		this.shutdown = true;

		// Check to see if we have a websocket
		if (this.webSocket !== null) {
			// Let the observers know that the device is disconnected
			this.notifyDeviceDisconnected();

			try {
				// Close the websocket
				this.webSocket.close();
			}
			catch(e) {
				this.logger.error(e);
			}
		}

		// Clear the listeners
		this.clearWebSocket();
	}
}
