import sdk = require('remote-pay-cloud-api');
import {CloverDeviceConfiguration} from './device/CloverDeviceConfiguration';
import {WebSocketCloudCloverDeviceConfiguration} from './device/WebSocketCloudCloverDeviceConfiguration';
import {Endpoints} from '../../util/Endpoints';
import {HttpSupport} from '../../util/HttpSupport';
import {ICloverConnectorFactory} from './ICloverConnectorFactory';
import {CloverConnector} from './CloverConnector';
import {BrowserWebSocketImpl} from '../../websocket/BrowserWebSocketImpl';
import {IImageUtil} from '../../util/IImageUtil';
import {ImageUtil} from '../../util/ImageUtil';

/**
 * This is for backwards compatibility.  It will not work for non-browser!!!
 *
 * This is the equivalent of the old way we created and ran the cloud.
 */
export class CloverConnectorFactory implements ICloverConnectorFactory {
    constructor() {
    }

    public createICloverConnector(configuration: any): sdk.remotepay.ICloverConnector {
        return new LegacyCloverConnector(configuration);
    }
}

/**
 * This connector uses Browser specific objects to work in a manner compatible with the
 * 1.1.0 implementation of the ICloverConnector.
 *
 * It uses the domain && clientId to get the oauthtoken, then gets the merchantId,
 * and the deviceId.  This process may involve redirection of the page, and XHR requests,
 * all of which are performed using default Browser objects.
 *
 * Once these values have been obtained, a new WebSocketCloudCloverDeviceConfiguration is
 * generated using the default Browser WebSocket implementation, and the connector is initialized.
 *
 */
export class LegacyCloverConnector extends CloverConnector {

    legacyConfiguration: any;

    private urlParamsInfo: { [key: string]: string } = null;
    static _accessTokenKey: string = 'access_token';
    static accessTokenKey: string = '#' + LegacyCloverConnector._accessTokenKey;
    static URL_MERCHANT_ID_KEY: string = "merchant_id";
    private httpSupport: HttpSupport;
    private imageUtil: IImageUtil;

    constructor(legacyConfiguration: any) {
        super(null);

        this.httpSupport = new HttpSupport(XMLHttpRequest);
        this.imageUtil = new ImageUtil();
        this.legacyConfiguration = legacyConfiguration;
    }

    public initializeConnection(): void {
        if (this.device == null) {
            this.initializeLegacyConnection(this.legacyConfiguration);
        }
    }

    /**
     * Generates a WebSocketCloudCloverDeviceConfiguration with a "raw" configuration
     * @param rawConfiguration - a Json object that has values that can be used to construct the
     *  object configuration.
     */
    protected generateNewConfigurationAndInitialize(rawConfiguration: any): void {
        let newConfig: WebSocketCloudCloverDeviceConfiguration = new WebSocketCloudCloverDeviceConfiguration(
            rawConfiguration.remoteApplicationId,
            BrowserWebSocketImpl.createInstance,
            this.imageUtil,
            rawConfiguration.domain,
            rawConfiguration.oauthToken,
            this.httpSupport,
            rawConfiguration.merchantId,
            rawConfiguration.deviceId,
            rawConfiguration.friendlyId,
            rawConfiguration.forceConnect);
        if (this.device == null) {
            this.initialize(newConfig);
        }
    }

    /**
     * Checks for a oauth token, does a redirect based on the configuration domain and
     * clientid if necessary, then moves on to #onceWeHaveTheAccessToken(...)
     *
     * @param configuration - the raw configuration object
     */
    protected initializeLegacyConnection(configuration: any) {

        if (configuration.oauthToken) {
            this.onceWeHaveTheAccessToken(configuration);
        } else {
            // We MUST have the domain and clientId, or we are unable to go on.
            if (configuration.domain && configuration.clientId) {
                // The following will return the token, or else the page will redirect.
                configuration.oauthToken = this.getAccessToken(configuration);
                this.onceWeHaveTheAccessToken(configuration);
            } else {
                let errorResponse: sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
                errorResponse.setCode(sdk.remotepay.DeviceErrorEventCode.InvalidConfig);
                errorResponse.setType(sdk.remotepay.ErrorType.EXCEPTION);
                errorResponse.setMessage("Both 'clientId' and 'domain' are unset.  Cannot initialize.");
                this.broadcaster.notifyOnDeviceError(errorResponse);
            }
        }
    }

    /**
     * Gets the merchantId, redirecting if necessary, then moves on to #getDeviceId(...)
     *
     * @param configuration - the raw configuration object
     */
    private onceWeHaveTheAccessToken(configuration: any) {
        // If we had the oauth token, but we do not have the merchantId, this will redirect
        configuration.merchantId = this.getMerchantId(configuration);
        // We need the deviceId in order to send the notification.
        if (configuration.deviceId) {
            this.generateNewConfigurationAndInitialize(configuration);
        } else {
            this.getDeviceId(configuration);
        }
    }

    /**
     * Gets the deviceId, calling the webservice to get the device list if necessary.
     * If the deviceId is not set, and the deviceSerialId is not set, then this will call
     * notify of an error. If the deviceId is not set, and the deviceSerialId is set then
     * the call to get the devices is made the result is used to build a mapping that is
     * passed to handleDeviceResult.
     *
     * @param configuration - the raw configuration object
     */
    private getDeviceId(configuration: any): void {
        if (configuration.deviceSerialId || configuration.deviceId) {
            if (configuration.deviceId) {
                this.generateNewConfigurationAndInitialize(configuration);
            } else {
                let devicesEndpoint: string = Endpoints.getDevicesEndpoint(
                    configuration.domain, configuration.merchantId, configuration.oauthToken);
                this.httpSupport.getData(devicesEndpoint,
                    function (devices) {
                        this.handleDeviceResult(LegacyCloverConnector.buildMapOfSerialToDevice(devices), configuration)
                    }.bind(this),
                    function (error) {
                        let errorResponse: sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
                        errorResponse.setCode(sdk.remotepay.DeviceErrorEventCode.InvalidConfig);
                        errorResponse.setType(sdk.remotepay.ErrorType.EXCEPTION);
                        errorResponse.setMessage(JSON.stringify({"Error retreiving devices:": error}, null, '\t'));
                        this.broadcaster.notifyOnDeviceError(errorResponse);
                    }.bind(this)
                );
            }
        } else {
            let errorResponse: sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
            errorResponse.setCode(sdk.remotepay.DeviceErrorEventCode.InvalidConfig);
            errorResponse.setType(sdk.remotepay.ErrorType.EXCEPTION);
            errorResponse.setMessage("Neither 'deviceId' or 'deviceSerialId' passed, one must be set.  Cannot initialize.");
            this.broadcaster.notifyOnDeviceError(errorResponse);
        }
    }

    /**
     * Builds a mapping of the passed set of devices, from the device serial number to the device.
     *
     * @param devicesVX
     * @returns {{}} the mapping from the device serial number to the device
     */
    protected static buildMapOfSerialToDevice(devicesVX): any {
        var devices = null;
        var deviceBySerial: { [key: string]: string } = {};
        // depending on the version of the call, the devices might be in a slightly different format.
        // We would need to determine what devices were capable of doing what we want.  This means we
        // need to know if the device has the websocket connection enabled.  The best way to do this is
        // to make a different REST call, but we could filter the devices here.
        if (devicesVX['devices']) {
            devices = devicesVX.devices;
        }
        else if (devicesVX['elements']) {
            devices = devicesVX.elements;
        }
        if (devices) {
            var i;
            for (i = 0; i < devices.length; i++) {
                deviceBySerial[devices[i].serial] = devices[i];
            }
        }
        return deviceBySerial;
    }

    /**
     * Uses the mapping of devices to find the correct deviceId to use in the configuration.
     * This then moves on to generateNewConfigurationAndInitialize.
     *
     * @param devices
     * @param configuration
     */
    protected handleDeviceResult(devices, configuration): void {
        var myDevice = devices[configuration.deviceSerialId];
        if (null == myDevice) {
            let errorResponse: sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
            errorResponse.setCode(sdk.remotepay.DeviceErrorEventCode.InvalidConfig);
            errorResponse.setType(sdk.remotepay.ErrorType.EXCEPTION);
            errorResponse.setMessage("Cannot determine device to use.  " +
                "Device " + configuration.deviceSerialId + " not in set returned.");
            this.broadcaster.notifyOnDeviceError(errorResponse);
        } else {
            // Stations do not support the kiosk/pay display.
            // If the user has selected one, then print out a (loud) warning
            if (myDevice.model == "Clover_C100") {
                this.logger.warn(
                    "Warning - Selected device model (" +
                    devices[configuration.deviceSerialId].model +
                    ") does not support pay display." +
                    "  Will attempt to send notification to device, but no response" +
                    " should be expected.");
            }
            configuration.deviceId = myDevice.id;
            this.generateNewConfigurationAndInitialize(configuration);
        }
    }

    /**
     * Get the merchantId or redirect.
     *
     * @param configuration
     * @returns {string|any}
     */
    private getMerchantId(configuration: any): string {
        if (!configuration.merchantId) {
            if (!this.urlParamsInfo) {
                if (configuration.domain && configuration.clientId) {
                    // We must have the merchant id.  This will make the merchant log in again.
                    this.getAccessToken(configuration);
                    let errorResponse: sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
                    errorResponse.setCode(sdk.remotepay.DeviceErrorEventCode.InvalidConfig);
                    errorResponse.setType(sdk.remotepay.ErrorType.EXCEPTION);
                    errorResponse.setMessage("Neither 'merchantId' or '" +
                        LegacyCloverConnector.URL_MERCHANT_ID_KEY + "' specified. Cannot initialize.");
                    this.broadcaster.notifyOnDeviceError(errorResponse);
                } else {
                    let errorResponse: sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
                    errorResponse.setCode(sdk.remotepay.DeviceErrorEventCode.InvalidConfig);
                    errorResponse.setType(sdk.remotepay.ErrorType.EXCEPTION);
                    errorResponse.setMessage("Both 'clientId' and 'domain' are unset.  Cannot initialize.");
                    this.broadcaster.notifyOnDeviceError(errorResponse);
                }
            } else {
                configuration.merchantId = this.urlParamsInfo[LegacyCloverConnector.URL_MERCHANT_ID_KEY];
            }
        }
        return configuration.merchantId;
    }

    /**
     * Get the access token, either from the configuration or from the window URL, or redirect.
     *
     * @param configuration
     * @returns {null}
     */
    private getAccessToken(configuration: any): string {
        this.parseWindowURL();

        var token = null;
        if (this.urlParamsInfo) {
            token = this.urlParamsInfo[LegacyCloverConnector.accessTokenKey];
        }
        if (token == null) {
            // There is no token attempt to redirect
            LegacyCloverConnector.redirect(configuration);
        }
        return token;
    }

    private static redirect(configuration: any): void {
        let finalRedirect: string = window.location.href.replace(window.location.hash, '');
        let oAuthRedirectUrl: string = Endpoints.getOAuthURL(configuration.domain, configuration.clientId, null, finalRedirect);
        window.location.href = oAuthRedirectUrl;
    }

    private parseWindowURL(): void {
        if (!this.urlParamsInfo) {
            this.parseURL(window.location);
        }
    }

    private parseURL(windowLocationObject: Location): void {
        this.urlParamsInfo = {};

        let params: string[] = windowLocationObject.hash.split('&');
        this.parseStuff(params);

        var params2 = windowLocationObject.search.substr(1).split('&');
        this.parseStuff(params2);
    }

    private parseStuff(params: string[]) {
        let i: number = 0;
        let param: string = null;
        while (param = params[i++]) {
            let multiParam: string[] = param.split("=");
            this.urlParamsInfo[multiParam[0]] = multiParam[1];
            // Make sure the access_token is mapped with the hash infront,
            // and without.
            if (multiParam[0] === LegacyCloverConnector._accessTokenKey) {
                this.urlParamsInfo[LegacyCloverConnector.accessTokenKey] = multiParam[1];
            }
        }
    }
}