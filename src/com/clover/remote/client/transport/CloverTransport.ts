import CloverTransportObserver from './CloverTransportObserver';

/**
 * Clover Transport
 * 
 * The clover transport facilitates notification distribution
 * from the device to a list of observers.
 */
export abstract class CloverTransport {
	// List of observers to notify
	observers: CloverTransportObserver[] = [];

	// Flag to determine if the device is ready
	ready: Boolean = false;

	constructor() {
		// This prevents developers from creating a new CloverTransport.
		// This class is abstract and needs to be extended with a custom
		// implementation.
		if (this.constructor === CloverTransport) {
			throw new TypeError('Abstract class "CloverTransport" cannot be instantiated directly.');
		}

		// Make sure the child class implements all abstract methods.
		if (this.sendMessage === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "sendMessage" method.');
		}
		if (this.dispose === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "dispose" method.');
		}
	}

	/**
	 * Notify observers that the device is connected
	 */
	protected notifyDeviceConnected(): void {
		this.observers.forEach((obs) => {
			obs.onDeviceConnected(this);
		});
	}

	/**
	 * Notify observers that the device is ready
	 */
	protected notifyDeviceReady(): void {
		this.ready = true;
		this.observers.forEach((obs) => {
			obs.onDeviceReady(this);
		});
	}

	/**
	 * Notify observers that the device has disconnected
	 */
	protected notifyDeviceDisconnected(): void {
		this.ready = false;
		this.observers.forEach((obs) => {
			obs.onDeviceDisconnected(this);
		});
	}

	/**
	 * Should be called by subclasses (_super.onMessage) when a message is received
	 * in order to forward to all observers
	 * 
	 * @param {string} message - The message we received
	 */
	protected onMessage(message: string): void {
		this.observers.forEach((obs) => {
			obs.onMessage(message);
		});
	}

	/**
	 * Send a message
	 * 
	 * @abstract
	 * @param {string} message - the message to send
	 * @return int - status indicator of 0 or -1 where 0 is success and -1 is failure
	 */
	public sendMessage(message: string): number {
		throw new Error('Abstract method not implemented');
	}

	/**
	 * Add new observer to receive notifications from the device
	 * 
	 * @param {CloverTransportObserver} observer - the observer to notify
	 */
	public subscribe(observer: CloverTransportObserver): void {
		if (this.ready) {
			this.observers.forEach((obs) => {
				obs.onDeviceReady(this);
			});
		}
		this.observers.push(observer);
	}

	/**
	 * Remove an observer from the list of observers
	 * 
	 * @param {CloverTransportObserver} observer - the observer to remove
	 */
	public unsubscribe(observer: CloverTransportObserver): void {
		var indexOfObserver = this.observers.indexOf(observer);
		if (indexOfObserver !== -1) {
			this.observers.splice(indexOfObserver, 1);
		}
	}

	/**
	 * Clear the observers list
	 */
	public clearListeners(): void {
		this.observers.splice(0, this.observers.length);
	}

	/**
	 * Properly dispose of this object
	 * 
	 * @abstract
	 */
	public dispose(): void {
		throw new Error('Abstract method not implemented');
	}
}

export default CloverTransport;
