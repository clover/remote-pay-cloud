import CloverDeviceConfiguration from './device/CloverDeviceConfiguration';
import ICloverConnector from './ICloverConnector';
import ICloverConnectorListener from './ICloverConnectorListener';
import Logger from './util/Logger';
//import CardEntryMethods from '../../../../../CardEntryMethods.js';

/**
 * Clover Connector
 * 
 * The clover connector implements the ICloverConnector interface. This is where
 * we define how the connector interacts with remote pay adapters.
 * 
 * @param {Map} config - the configuration for the connector
 */
export class CloverConnector implements ICloverConnector {
	// Create a logger
	logger: Logger = Logger.create();

	cloverConnectorListener: ICloverConnectorListener;

	// List of listeners to broadcast notifications to.
	cloverConnectorListeners: ICloverConnectorListener[] = [];

	// Device Configuration for this connector.
	configuration: CloverDeviceConfiguration;

	constructor(configuration: CloverDeviceConfiguration) {
		// Try to load the configuration.
		if (configuration) {
			try {
				// Make sure we do not change the passed object, make a copy.
				this.configuration = JSON.parse(JSON.stringify(configuration));
			}
			catch(e) {
				this.logger.error(['Could not load configuration', e]);
				throw e;
			}
		}
	}

	/**
	 * Initialize the connector with a new config
	 * 
	 * @param {CloverDeviceConfiguration} config - the configuration for the connector
	 */
	public initialize(configuration: CloverDeviceConfiguration): void {
		try {
			// Make sure we do not change the passed object, make a copy.
			this.configuration = JSON.parse(JSON.stringify(configuration));
		}
		catch(e) {
			this.logger.error(['Could not load configuration', e]);
			throw e;
		}
	}

	/**
	 * Add new listener to receive broadcast notifications
	 * 
	 * @param {ICloverConnectorListener} connectorListener - the listener to add
	 */
	public addCloverConnectorListener(connectorListener: ICloverConnectorListener): void {
		this.cloverConnectorListeners.push(connectorListener);
	}

	/**
	 * Remove a listener
	 * 
	 * @param {ICloverConnectorListener} connectorListener - the listener to remove
	 */
	public removeCloverConnectorListener(connectorListener: ICloverConnectorListener): void {
		var indexOfListener = this.cloverConnectorListeners.indexOf(connectorListener);
		if (indexOfListener !== -1) {
			this.cloverConnectorListeners.splice(indexOfListener, 1);
		}
	}
}

export default CloverConnector;
