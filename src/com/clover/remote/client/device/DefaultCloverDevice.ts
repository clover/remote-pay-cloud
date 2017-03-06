import sdk from 'remote-pay-cloud-api';
import CloverDevice from './CloverDevice';
import CloverTransport from '../transport/CloverTransport';
import CloverTransportObserver from '../transport/CloverTransportObserver';
import CloverDeviceConfiguration from './CloverDeviceConfiguration';

/**
 * Default Clover Device
 * 
 * This is a default implementation of the clover device.
 */
export class DefaultCloverDevice extends CloverDevice implements CloverTransportObserver {
    private static id: number = 0;

    constructor(configuration: CloverDeviceConfiguration);
	constructor(packageName: string, transport: CloverTransport, applicationId: string);
    constructor(configOrPackageName?: CloverDeviceConfiguration | string, transport?: CloverTransport, applicationId?: string) {
        if (typeof configOrPackageName == 'string') {
            super(configOrPackageName, transport, applicationId);
        }
        else {
    		super(configOrPackageName.getMessagePackageName(), configOrPackageName.getCloverTransport(), configOrPackageName.getApplicationId());
        }
		this.transport.subscribe(this);
	}

    /**
     * Device is there but not yet ready for use
     * 
     * @param {CloverTransport} transport - the transport holding the notifications
     */
    public onDeviceConnected(transport: CloverTransport): void {
        this.notifyObserversConnected(transport);
    }

    /**
     * Device is there and ready for use
     * 
     * @param {CloverTransport} transport - the transport holding the notifications
     */
    public onDeviceReady(transport: CloverTransport): void {
        this.doDiscoveryRequest();
    }

    /**
     * Device is not there anymore
     * 
     * @param {CloverTransport} transport - the transport holding the notifications
     */
    public onDeviceDisconnected(transport: CloverTransport): void {
        this.notifyObserversDisconnected(transport);
    }

    public getApplicationId(): string {
        return this.applicationId;
    }

    /**
     * Called when a raw message is received from the device
     * 
     * @param {string} message - the raw message from the device
     */
    public onMessage(transport: string): void {}

    /**
     * Notify the observers that the device is connected
     * 
     * @param transport 
     */
    private notifyObserversConnected(transport: CloverTransport): void {
		this.deviceObservers.forEach((obs) => {
			obs.onDeviceConnected(this);
		});
    }

    /**
     * Notify the observers that the device has disconnected
     * 
     * @param transport 
     */
    private notifyObserversDisconnected(transport: CloverTransport): void {
		this.deviceObservers.forEach((obs) => {
			obs.onDeviceDisconnected(this);
		});
    }

    /**
     * Notify the observers that the device is ready
     * 
     * @param transport 
     */
    private notifyObserversReady(transport: CloverTransport, drm: sdk.remotemessage.DiscoveryResponseMessage): void {
		this.deviceObservers.forEach((obs) => {
			obs.onDeviceReady(this, drm);
		});
    }
}

export default DefaultCloverDevice;
