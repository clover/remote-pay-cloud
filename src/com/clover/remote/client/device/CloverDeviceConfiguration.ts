import {CloverTransport} from '../transport/CloverTransport';
import {IImageUtil} from '../../../util/IImageUtil';

/**
 * Clover Device Configuration
 * 
 * The clover device configuration tells the device factory which device
 * to create.
 */
export interface CloverDeviceConfiguration {
	/**
	 * Get Clover Device Type
	 * 
	 * @returns class - Device Type
	 */
	getCloverDeviceType(): any;

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

	/**
	 * Get Image Utility
	 *
	 * @returns IImageUtil - Image Utility
	 */
	getImageUtil(): IImageUtil;

	/**
	 * Get the max message size in characters
	 *
	 * @returns number - size
	 */
	getMaxMessageCharacters(): number;
}
