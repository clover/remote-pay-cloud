import * as testCloverConnectorListener from "./TestCloverConnectorListener";
import {LogLevel, Logger} from "./util/Logger";
import {WebSocketCloudCloverDeviceConfiguration} from "../../../dist/com/clover/remote/client/device/WebSocketCloudCloverDeviceConfiguration";
import {WebSocketPairedCloverDeviceConfiguration} from "../../../dist/com/clover/remote/client/device/WebSocketPairedCloverDeviceConfiguration";
import {CloverConnectorFactoryBuilder} from "../../../dist/com/clover/remote/client/CloverConnectorFactoryBuilder";
import {BrowserWebSocketImpl} from "../../../dist/com/clover/websocket/BrowserWebSocketImpl";
import {ImageUtil} from "../../../dist/com/clover/util/ImageUtil";
import {HttpSupport} from "../../../dist/com/clover/util/HttpSupport";
import * as sdk from "remote-pay-cloud-api";

const create = (connectorConfig) => {
    return {
        initializeConnection: function (testConfig) {
            Logger.log(LogLevel.TRACE, "Device Connection: Initializing connection to Clover Connector.");
            // Resolved when the device is ready to process requests.
            const connectionInitializedDeferred = new jQuery.Deferred();

            if (cloverConnector != null) {
                Logger.log(LogLevel.INFO, "A Clover Connector already exists and is ready to process requests!");
                connectionInitializedDeferred.resolve("Device Ready");
                return connectionInitializedDeferred.promise();
            }

            const baseConfiguration = {
                "applicationId": connectorConfig.applicationId,
                "posName": "Cloud Starter POS",
                "serialNumber": "Register_1",
                "webSocketFactoryFunction": BrowserWebSocketImpl.createInstance,
                "imageUtil": new ImageUtil()
            };
            let cloverDeviceConnectionConfiguration = null;
            const useCloudConfiguration = connectorConfig.type === "cloud";
            if (!useCloudConfiguration) {
                Logger.log(LogLevel.TRACE, `Device Connection:  Connecting via the Network.`);
                const endpoint = `${connectorConfig.wsScheme}://${connectorConfig.ipAddress}:${connectorConfig.wsPort}/remote_pay`;
                const networkConfiguration = {
                    "endpoint": endpoint
                }
                const authToken = getAuthToken();
                if (authToken && authToken.length > 0) {
                    Logger.log(LogLevel.TRACE, `Device Connection: Using cached auth token ${authToken}`);
                    networkConfiguration["authToken"] = authToken;
                }
                cloverDeviceConnectionConfiguration = getDeviceConfigurationForNetwork(Object.assign({}, baseConfiguration, networkConfiguration));
            } else {
                Logger.log(LogLevel.TRACE, `Device Connection:  Connecting via the Cloud.`);
                cloverDeviceConnectionConfiguration = getDeviceConfigurationForCloud(Object.assign({}, baseConfiguration, {
                    "accessToken": connectorConfig.accessToken,
                    "cloverServer": connectorConfig.cloverServer,
                    "httpSupport": new HttpSupport(XMLHttpRequest),
                    "merchantId": connectorConfig.merchantId,
                    "deviceId": connectorConfig.deviceId,
                    "friendlyId": "Automated Test"
                }));
            }
            let builderConfiguration = {};
            builderConfiguration[CloverConnectorFactoryBuilder.FACTORY_VERSION] = CloverConnectorFactoryBuilder.VERSION_12;
            let cloverConnectorFactory = CloverConnectorFactoryBuilder.createICloverConnectorFactory(builderConfiguration);
            cloverConnector = cloverConnectorFactory.createICloverConnector(cloverDeviceConnectionConfiguration);
            const startupListener = buildCloverConnectionStartUpListener(cloverConnector, connectionInitializedDeferred);
            cloverConnector.addCloverConnectorListener(startupListener);
            cloverConnector.initializeConnection();

            const connectorReadyTimeout = testConfig["connectorReadyTimeout"] || 15000;
            // If the connection is not established in testConfig["connectorReadyTimeout"] millis, timeout and reject.
            setTimeout(() => connectionInitializedDeferred.reject(504), connectorReadyTimeout);
            return connectionInitializedDeferred.promise();
        },

        closeConnection: function () {
            if (cloverConnector != null) {
                Logger.log(LogLevel.INFO, "Closing Clover Connector.");
                if (listener != null) {
                    cloverConnector.removeCloverConnectorListener(listener);
                    listener = null;
                }
                cloverConnector.dispose();
                cloverConnector = null;
            }
        },

        getCloverConnector: function () {
            return cloverConnector;
        },

        getListener: function () {
            return listener;
        }
    }

    // Private Members

    var cloverConnector = null;
    var listener = null;
    var authToken = null;

    /**
     * The definition of the listener.  It extends the functionality to the "interface" ICloverConnectorListener.
     * This implementation has a reference to the ICloverConnector passed in so that it can use it during the
     * program lifecycle.
     *
     * @param cloverConnector
     * @param connectionInitializedDeferred - jQuery deferred, resolved when the device is ready.
     *
     * @constructor
     */
    function buildCloverConnectionStartUpListener(cloverConnector, connectionInitializedDeferred) {
        return Object.assign({}, sdk.remotepay.ICloverConnectorListener.prototype, {
            onDeviceReady: function (merchantInfo) {
                Logger.log(LogLevel.INFO, {message: "Device Ready to process requests!", merchantInfo: merchantInfo});
                cloverConnector.removeCloverConnectorListener(this);
                listener = Object.assign({}, sdk.remotepay.ICloverConnectorListener.prototype, testCloverConnectorListener.create(cloverConnector));
                cloverConnector.addCloverConnectorListener(listener);
                connectionInitializedDeferred.resolve("Device Ready");
            }
        });
    };

    function getDeviceConfigurationForCloud(connectionConfiguration) {
        return new WebSocketCloudCloverDeviceConfiguration(
            connectionConfiguration.applicationId,
            connectionConfiguration.webSocketFactoryFunction,
            connectionConfiguration.imageUtil,
            connectionConfiguration.cloverServer,
            connectionConfiguration.accessToken,
            connectionConfiguration.httpSupport,
            connectionConfiguration.merchantId,
            connectionConfiguration.deviceId,
            connectionConfiguration.friendlyId,
            connectionConfiguration.forceReconnect);
    };

    function getDeviceConfigurationForNetwork(connectionConfiguration) {
        let deviceConfiguration = new WebSocketPairedCloverDeviceConfiguration(
            connectionConfiguration.endpoint,
            connectionConfiguration.applicationId,
            connectionConfiguration.posName,
            connectionConfiguration.serialNumber,
            connectionConfiguration.authToken,
            connectionConfiguration.webSocketFactoryFunction,
            connectionConfiguration.imageUtil);
        // Append the pairing code handlers to the device configuration.
        deviceConfiguration = Object.assign(deviceConfiguration, {
            onPairingCode: function (pairingCode) {
                let pairingCodeMessage = `Please enter pairing code ${pairingCode} on the device`;
                Logger.log(LogLevel.INFO, `    >  ${pairingCodeMessage}`);
            },
            onPairingSuccess: function (authToken) {
                Logger.log(LogLevel.INFO, `    >  Got Pairing Auth Token: ${authToken}`);
                setAuthToken(authToken);
            }
        });
        return deviceConfiguration;
    };

    function getAuthToken() {
        return authToken;
    };

    function setAuthToken(authTokenIn) {
        authToken = authTokenIn;
    };

};

export {create}
