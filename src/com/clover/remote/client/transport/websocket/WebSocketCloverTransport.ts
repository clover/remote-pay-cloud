import CloverTransport from '../CloverTransport.js';
import Logger from '../../util/Logger';

/**
 * WebSocket Clover Transport
 * 
 * This is a websocket implementation of the Clover Transport.
 */
export class WebSocketCloverTransport extends CloverTransport {
	// Create a logger
	logger: Logger = Logger.create();

	// Websocket config values
	endpoint: string;
	heartbeatInterval: number;
	reconnectDelay: number;
	retriesUntilDisconnect: number;
	posName: string;
	serialNumber: string;
	authToken: string;

	// The websocket we will use
	webSocket: any = null;

	// Flag to indicate if we are shutting down
	shutdown: boolean = false;

	/**
	 * @param {string} endpoint 
	 * @param {number} heartbeatInterval 
	 * @param {number} reconnectDelay 
	 * @param {number} retriesUntilDisconnect 
	 * @param {string} posName 
	 * @param {string} serialNumber 
	 * @param {string} authToken 
	 */
	constructor(endpoint: string, heartbeatInterval: number, reconnectDelay: number, retriesUntilDisconnect: number, posName: string, serialNumber: string, authToken: string) {
		super();

		// Ensure these values are numbers
		heartbeatInterval = isNaN(heartbeatInterval) ? 0 : heartbeatInterval;
		reconnectDelay = isNaN(reconnectDelay) ? 0 : reconnectDelay;
		retriesUntilDisconnect = isNaN(retriesUntilDisconnect) ? 0 : retriesUntilDisconnect;

		// Fill in the websocket config values
		this.endpoint = endpoint;
		this.heartbeatInterval = Math.max(10, heartbeatInterval);
		this.reconnectDelay = Math.max(0, reconnectDelay);
		this.retriesUntilDisconnect = Math.max(0, retriesUntilDisconnect);
		this.posName = posName;
		this.serialNumber = serialNumber;
		this.authToken = authToken;

		// Initialize the websocket
		this.initialize(endpoint);
	}

	/**
	 * Initialize the websocket
	 * 
	 * @param {string} endpoint - the endpoint for the websocket to connect to
	 */
	private initialize(endpoint: string): void {
		// Check to see if we have a websocket already
		if (this.webSocket !== null) {
			// Check to see if the websocket is open or connecting
			if (this.webSocket.open || this.webSocket.connecting) {
				// Just wait for it to connect
				return;
			}
			else {
				// Clear the websocket listeners
				this.clearWebSocket();
			}
		}

		// Create a new websocket

		// Connect to the endpoint
	}

	/**
	 * Clear the websocket listeners
	 */
	private clearWebSocket(): void {
		// Check to see if the websocket exists
		if (this.webSocket !== null) {
			// Clear the listeners
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
	}

	/**
	 * Websocket connection is open
	 */
	public onOpen(): void {
		// Let the observers know that we are connected
		this.notifyDeviceConnected();
		this.logger.debug('Open...');
	}

	/**
	 * Websocket connection is closed
	 */
	public onClose(): void {
		// Let the observers know that we are no longer connected
		this.notifyDeviceDisconnected();
		this.clearWebSocket();
		this.logger.debug('Closed...');

		// Check to see if we can reconnect
		if (!this.shutdown) {
			setTimeout((args) => {
				this.reconnect();
			}, this.reconnectDelay);
		}
	}

	/**
	 * Clean up and dispose
	 * 
	 * @override
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

export default WebSocketCloverTransport;
