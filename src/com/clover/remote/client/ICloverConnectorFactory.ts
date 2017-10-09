import * as sdk from 'remote-pay-cloud-api';

/**
 * The Factory interface to produce ICloverConnectors.
 *
 */
export interface ICloverConnectorFactory {
    createICloverConnector(configuration: any): sdk.remotepay.ICloverConnector;
}