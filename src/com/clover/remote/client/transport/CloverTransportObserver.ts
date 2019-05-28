import * as sdk from 'remote-pay-cloud-api';
import {CloverTransport} from './CloverTransport';

/**
 * Clover Transport Observer
 *
 * The transport observer listens for notifications and handles them.
 */
export interface CloverTransportObserver {
    /**
     * Notify observers that we are connected.  What "connected" means depends on the transport mechanism.
     *
     * For network (SNPD) this means that we have connected to the Clover device.
     * For cloud (CPD) this means that we have connected to the cloud proxy.
     */
    onConnected(transport: CloverTransport): void;

    /**
     * @param transport
     * @deprecated - see onConnected.
     */
    onDeviceConnected(transport: CloverTransport): void;

    /**
     * Notify observers that we are ready to send messages.  This has different meanings depending on the transport mechanism.
     *
     * For network (SNPD) this means that we have connected to and successfully pinged the Clover device.
     * For cloud (CPD) this means that we have connected to and successfully pinged the cloud proxy.
     *
     * This is generally used to indicate that we are clear to initiate the device via a Discovery Request.
     *
     * Note: this does not mean the device is ready to take a payment through the SDK, which is solely determined
     * by the receipt of a Discovery Response (see DefaultCloverDevice.notifyObserversReady).
     */
    onReady(transport: CloverTransport): void;

    /**
     * @param transport
     * @deprecated - see onReady.
     */
    onDeviceReady(transport: CloverTransport): void;

    /**
     * Notify observers that the connection attempt is complete.  This is critical for retry logic at the device level.
     *
     * @param transport
     */
    onConnectionAttemptComplete(transport: CloverTransport): void;

    /**
     * Notify observers that we are disconnected.  What "disconnected" means depends on the transport mechanism.
     *
     * For network (SNPD) this means that we have disconnected from the Clover device.
     * For cloud (CPD) this means that we have disconnected from the cloud proxy.
     */
    onDisconnected(transport: CloverTransport, message?: string): void;

    /**
     * @param transport
     * @deprecated - see onDisconnected.
     */
    onDeviceDisconnected(transport: CloverTransport): void;

    /**
     * Device experienced an error on the transport.
     */
    onDeviceError(cloverDeviceEvent: sdk.remotepay.CloverDeviceErrorEvent): void;

    /**
     * Called when a raw message is received from the device
     *
     * @param {string} message - the raw message from the device
     */
    onMessage(message: string): void;
}
