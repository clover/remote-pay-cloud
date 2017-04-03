import sdk = require('remote-pay-cloud-api');
import {CloverDeviceConfiguration} from './device/CloverDeviceConfiguration';
import {WebSocketCloudCloverDeviceConfiguration} from './device/WebSocketCloudCloverDeviceConfiguration';
import {Endpoints} from '../../util/Endpoints';
import {HttpSupport} from '../../util/HttpSupport';
import {ICloverConnectorFactory} from './ICloverConnectorFactory';
import {CloverConnector} from './CloverConnector';
import {BrowserWebSocketImpl} from '../../websocket/BrowserWebSocketImpl';

/**
 * This is for backwards compatibility.  It will not work for non-browser!!!
 *
 * This is the equivalent of the old way we created and ran the cloud.
 */
export class CloverConnectorFactory implements ICloverConnectorFactory {
    constructor() {
    }

    public createICloverConnector(configuration:any):sdk.remotepay.ICloverConnector {
        return new LegacyCloverConnector(configuration);
    }

}

export class LegacyCloverConnector extends CloverConnector {

    legacyConfiguration:any;

    private urlParamsInfo:{[key: string]: string} = null;
    static _accessTokenKey:string = 'access_token';
    static accessTokenKey:string = '#' + LegacyCloverConnector._accessTokenKey;
    static URL_MERCHANT_ID_KEY:string = "merchant_id";
    private httpSupport:HttpSupport;

    constructor(legacyConfiguration:any) {
        super(null);

        this.httpSupport = new HttpSupport(XMLHttpRequest);
        this.legacyConfiguration = legacyConfiguration;
    }

    public initializeConnection(): void {
        if (this.device == null) {
            this.initializeLegacyConnection(this.legacyConfiguration);
        }
    }

    protected generateNewConfigurationAndInitialize(rawConfiguration:any):void {
        let newConfig: WebSocketCloudCloverDeviceConfiguration = new WebSocketCloudCloverDeviceConfiguration(
                    rawConfiguration.remoteApplicationId,
                    BrowserWebSocketImpl.createInstance,
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

    protected initializeLegacyConnection(configuration:any) {
        /*
         Example of old configuration

         {
         "clientId": "16Q4XMGDSZ2NT",
         "remoteApplicationId": "com.clover.remotepay.cloud.unit.examples.nope:0.0.1-beta1",
         "deviceSerialId": "C030UQ50550081",
         "domain": "http://localhost:9000/",
         "friendlyId": "C030UQ50550081-Localhost-heroku"
         }

         We need a way to build this into the configuration the new impl needs.

         1.  Check the config for "oauthToken"
         If it is not there check the url for the access_token.
         If it is not there:
         Use the clientId and domain to get the OAuth token.  The url is
         {domain}/oauth/authorize?client_id={clientId}
         Use Endpoints.getOAuthURL(domain:string, clientId:string, merchantId?:string, redirectUri?:string) like thus:
         oAuthUrl = Endpoints.getOAuthURL(domain, clientId, null, redirectUri);
         The redirectUrl should be the current page. (see CloverOAuth2.prototype.getOAuthURL)
         At this point, we quit.  It is odd, but we rely on the page using this to call the factory again.
         */
        if(configuration.oauthToken) {
            this.onceWeHaveTheAccessToken(configuration);
        } else {
            // We MUST have the domain and clientId, or we are unable to go on.
            if (configuration.domain && configuration.clientId) {
                // The following will return the token, or else the page will redirect.
                configuration.oauthToken = this.getAccessToken(configuration);
                this.onceWeHaveTheAccessToken(configuration);
            } else {
                let errorResponse:sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
                errorResponse.setCode(sdk.remotepay.DeviceErrorEventCode.InvalidConfig);
                errorResponse.setType(sdk.remotepay.ErrorType.EXCEPTION);
                errorResponse.setMessage("Both 'clientId' and 'domain' are unset.  Cannot initialize.");
                this.broadcaster.notifyOnDeviceError(errorResponse);
            }
        }
    }

    private onceWeHaveTheAccessToken(configuration:any) {
        configuration.merchantId = this.getMerchantId(configuration);
        // We need the deviceId in order to send the notification.
        if(configuration.deviceId) {
            this.generateNewConfigurationAndInitialize(configuration);
        } else {
            this.getDeviceId(configuration);
        }
    }

    private getDeviceId(configuration:any):void {
        if (configuration.deviceSerialId) {
            let devicesEndpoint:string = Endpoints.getDevicesEndpoint(
                configuration.domain, configuration.merchantId, configuration.oauthToken);
            this.httpSupport.getData(devicesEndpoint,
                function (devices) { this.handleDeviceResult(LegacyCloverConnector.buildMapOfSerialToDevice(devices), configuration)}.bind(this),
                function (error) {
                    let errorResponse:sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
                    errorResponse.setCode(sdk.remotepay.DeviceErrorEventCode.InvalidConfig);
                    errorResponse.setType(sdk.remotepay.ErrorType.EXCEPTION);
                    errorResponse.setMessage(JSON.stringify({"Error retreiving devices:":error}, null,'\t'));
                    this.broadcaster.notifyOnDeviceError(errorResponse);
                }.bind(this)
            );
        } else {
            let errorResponse:sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
            errorResponse.setCode(sdk.remotepay.DeviceErrorEventCode.InvalidConfig);
            errorResponse.setType(sdk.remotepay.ErrorType.EXCEPTION);
            errorResponse.setMessage("Neither 'deviceId' or 'deviceSerialId' passed, one must be set.  Cannot initialize.");
            this.broadcaster.notifyOnDeviceError(errorResponse);
        }
    }

    protected static buildMapOfSerialToDevice(devicesVX): any {
        var devices = null;
        var deviceBySerial: {[key: string]: string} = {};
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

    protected handleDeviceResult(devices, configuration): void {
        var myDevice = devices[configuration.deviceSerialId];
        if (null == myDevice) {
            let errorResponse:sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
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

    private getMerchantId(configuration:any): string {
        if(!configuration.merchantId) {
            if(!this.urlParamsInfo) {
                // We must have the merchant id.  This will make the merchant log in again.
                this.getAccessToken(configuration);
                let errorResponse:sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
                errorResponse.setCode(sdk.remotepay.DeviceErrorEventCode.InvalidConfig);
                errorResponse.setType(sdk.remotepay.ErrorType.EXCEPTION);
                errorResponse.setMessage("Neither 'merchantId' or '" +
                    LegacyCloverConnector.URL_MERCHANT_ID_KEY + "' specified. Cannot initialize.");
                this.broadcaster.notifyOnDeviceError(errorResponse);
            } else {
                configuration.merchantId = this.urlParamsInfo[LegacyCloverConnector.URL_MERCHANT_ID_KEY];
            }
        }
        return configuration.merchantId;
    }

    private getAccessToken(configuration:any): string {
        this.parseWindowURL();

        var token = null;
        if(this.urlParamsInfo) {
            token = this.urlParamsInfo[LegacyCloverConnector.accessTokenKey];
        }
        if (token == null) {
            // There is no token attempt to redirect
            LegacyCloverConnector.redirect(configuration);
        }
        return token;
    }

    private static redirect(configuration:any): void {
        let finalRedirect:string = window.location.href.replace(window.location.hash, '');
        let oAuthRedirectUrl:string = Endpoints.getOAuthURL(configuration.domain, configuration.clientId, null, finalRedirect);
        window.location.href = oAuthRedirectUrl;
    }

    private parseWindowURL(): void {
        if(!this.urlParamsInfo) {
            this.parseURL(window.location);
        }
    }

    private parseURL(windowLocationObject:Location): void {
        this.urlParamsInfo = {};

        let params: string[] = windowLocationObject.hash.split('&');
        this.parseStuff(params);

        //let i:number = 0;
        //let param:string = null;
        //while (param = params[i++]) {
        //    let multiParam:string[] = param.split("=");
        //    this.urlParamsInfo[multiParam[0]] = multiParam[1];
        //    // Make sure the access_token is mapped with the hash infront,
        //    // and without.
        //    if(multiParam[0] === LegacyCloverConnector._accessTokenKey) {
        //        this.urlParamsInfo[LegacyCloverConnector.accessTokenKey] = multiParam[1];
        //    }
        //}

        var params2 = windowLocationObject.search.substr(1).split('&');
        this.parseStuff(params2);
        //for (var i2 = 0; i2 < params2.length; i++) {
        //    var p = params2[i2].split('=');
        //    this.urlParamsInfo[p[0]] = decodeURIComponent(p[1]);
        //}
    }

    private parseStuff(params: string[]) {
        let i:number = 0;
        let param:string = null;
        while (param = params[i++]) {
            let multiParam:string[] = param.split("=");
            this.urlParamsInfo[multiParam[0]] = multiParam[1];
            // Make sure the access_token is mapped with the hash infront,
            // and without.
            if(multiParam[0] === LegacyCloverConnector._accessTokenKey) {
                this.urlParamsInfo[LegacyCloverConnector.accessTokenKey] = multiParam[1];
            }
        }
    }
}