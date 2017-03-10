import {CloverTransport} from '../transport/CloverTransport';

/**
 * Clover Device Configuration
 * 
 * The clover device configuration tells the device factory which device
 * to create.
 */
export interface CloverDeviceConfiguration {
	/**
	 * Get Clover Device Type Name
	 * 
	 * @returns string - Device Type Name
	 */
	getCloverDeviceTypeName(): string;

	/**
	 * Get Message Package Name
	 * 
	 * @returns string - Message Package Name
	 */
	getMessagePackageName(): string;

	/**
	 * Get Name
	 * 
	 * @returns string - Name
	 */
	getName(): string;

	/**
	 * Get Clover Transport
	 * 
	 * @returns CloverTransport
	 */
	getCloverTransport(): CloverTransport;

	/**
	 * Get Application ID
	 * 
	 * @returns string - Application ID
	 */
	getApplicationId(): string;
}
