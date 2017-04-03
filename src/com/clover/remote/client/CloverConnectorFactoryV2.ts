import sdk = require('remote-pay-cloud-api');

import {CloverDeviceConfiguration} from './device/CloverDeviceConfiguration';
import {ICloverConnectorFactory} from './ICloverConnectorFactory';
import {CloverConnector} from './CloverConnector';

/**
 * Simple implementation for V1.2 right now.
 *
 */
export class CloverConnectorFactoryV2 implements ICloverConnectorFactory {
    constructor() {
    }
    public createICloverConnector(configuration:CloverDeviceConfiguration):sdk.remotepay.ICloverConnector {
        return new CloverConnector(configuration);
    }
}