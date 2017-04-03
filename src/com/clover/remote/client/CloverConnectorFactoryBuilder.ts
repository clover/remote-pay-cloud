import {ICloverConnectorFactory} from './ICloverConnectorFactory';
import {CloverConnectorFactoryV2} from './CloverConnectorFactoryV2';
import {CloverConnectorFactory} from './CloverConnectorFactory';

/**
 * This is for backwards compatibility.  It will not work for non-browser!!!
 *
 * This is the equivalent of the old way we created and ran the cloud.
 */
export class CloverConnectorFactoryBuilder {

    public static DEFAULT_VERSION:string = "DEFAULT";

    public static VERSION_12:string = "VERSION_12";
    public static FACTORY_VERSION:string = "FACTORY_VERSION";

    public static createICloverConnectorFactory(configuration:any): ICloverConnectorFactory {
        if(configuration[CloverConnectorFactoryBuilder.FACTORY_VERSION]) {
            if(configuration[CloverConnectorFactoryBuilder.FACTORY_VERSION] == CloverConnectorFactoryBuilder.VERSION_12) {
                return new CloverConnectorFactoryV2();
            }
        } else {
            // Technically the oldest version, only supports browser compatible connectors.
            return new CloverConnectorFactory();
        }
    }
}