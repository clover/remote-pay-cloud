import {CloverTransport} from './CloverTransport';

/**
 * Clover Transport Observer
 * 
 * The transport observer listens for notifications and handles them.
 */
export interface CloverTransportObserver {
    /**
     * Device is there but not yet ready for use
     * 
     * @param {CloverTransport} transport - the transport holding the notifications
     */
    onDeviceConnected(transport: CloverTransport): void;

    /**
     * Device is there and ready for use
     * 
     * @param {CloverTransport} transport - the transport holding the notifications
     */
    onDeviceReady(transport: CloverTransport): void;

    /**
     * Device is not there anymore
     * 
     * @param {CloverTransport} transport - the transport holding the notifications
     */
    onDeviceDisconnected(transport: CloverTransport): void;

    /**
     * Called when a raw message is received from the device
     * 
     * @param {string} message - the raw message from the device
     */
    onMessage(message: string): void;
}
