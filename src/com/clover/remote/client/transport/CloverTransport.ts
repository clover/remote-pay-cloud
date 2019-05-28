import {CloverTransportObserver} from './CloverTransportObserver';
import {ObjectMessageSender} from './ObjectMessageSender';

/**
 * Clover Transport
 *
 * The clover transport facilitates notification distribution
 * from the device to a list of observers.
 */
export abstract class CloverTransport {
    // List of observers to notify
    protected observers: CloverTransportObserver[] = [];

    // Used to send remote messages, like pairing messages
    protected objectMessageSender: ObjectMessageSender;

    // Flag to determine if the device is ready
    protected ready: Boolean = false;

    protected constructor() {}

    /**
     * @deprecated - see notifyConnected.
     */
    protected notifyDeviceConnected(): void {
        this.notifyConnected();
    }

    /**
     * Notify observers that we are connected.  What "connected" means depends on the transport mechanism.
     *
     * For network (SNPD) this means that we have connected to the Clover device.
     * For cloud (CPD) this means that we have connected to the cloud proxy.
     */
    protected notifyConnected(): void {
        this.observers.forEach((obs) => {
            obs.onConnected(this);
        });
    }

    /**
     * @deprecated - see notifyReady.
     */
    protected notifyDeviceReady(): void {
        this.notifyReady();
    }

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
    protected notifyReady(): void {
        this.ready = true;
        this.observers.forEach((obs) => {
            obs.onReady(this);
        });
    }

    /**
     * @deprecated - see notifyDisconnected.
     */
    protected notifyDeviceDisconnected(): void {
        this.notifyDisconnected();
    }

    /**
     * Notify observers that we are disconnected.  What "disconnected" means depends on the transport mechanism.
     *
     * For network (SNPD) this means that we have disconnected from the Clover device.
     * For cloud (CPD) this means that we have disconnected from the cloud proxy.
     */
    protected notifyDisconnected(): void {
        this.ready = false;
        this.observers.forEach((obs) => {
            obs.onDisconnected(this);
        });
    }

    protected notifyConnectionAttemptComplete(): void {
        this.observers.forEach((obs) => {
            obs.onConnectionAttemptComplete(this);
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
                obs.onReady(this);
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


    public setObjectMessageSender(objectMessageSender: ObjectMessageSender): void {
        this.objectMessageSender = objectMessageSender;
    }

    /**
     * Initializes this transport.
     */
    public abstract initialize(): void;

    /**
     * Properly dispose of this object
     */
    public abstract dispose(): void;

    /**
     * Has the transport been shutdown?
     */
    public abstract isShutdown(): boolean;

    /**
     * Request a disconnect then reconnect
     */
    public abstract reset(): void
}
