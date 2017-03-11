import {CloverTransportObserver} from './CloverTransportObserver';

/**
 * Clover Transport
 * 
 * The clover transport facilitates notification distribution
 * from the device to a list of observers.
 */
export abstract class CloverTransport {
	// List of observers to notify
	protected observers: CloverTransportObserver[] = [];

	// Flag to determine if the device is ready
	protected ready: Boolean = false;

	constructor() {
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
	 * @param {string} message - the message to send
	 * @return int - status indicator of 0 or -1 where 0 is success and -1 is failure
	 */
	public abstract sendMessage(message: string): number;

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
	 */
	public abstract dispose(): void;
}
