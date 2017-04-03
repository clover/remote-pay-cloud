import sdk = require('remote-pay-cloud-api');

export interface ICloverConnectorFactory {
    createICloverConnector(configuration:any):sdk.remotepay.ICloverConnector;
}