import * as testCloverConnectorListener from "./TestCloverConnectorListener";
import {LogLevel, Logger} from "./util/Logger";
import * as clover from "remote-pay-cloud";
import * as sdk from "remote-pay-cloud-api";
import * as EventService from "../app/EventService"

const create = (connectorConfig) => {
    return {
        initializeConnection: function (testConfig, parentComponent) {
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
                "webSocketFactoryFunction": clover.BrowserWebSocketImpl ? clover.BrowserWebSocketImpl.createInstance : null,
                "imageUtil": clover.ImageUtil ? new clover.ImageUtil() : null
            };
            let cloverDeviceConnectionConfiguration = null;
            const useCloudConfiguration = connectorConfig.type === "cloud";
            const legacy = connectorConfig.legacy;
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
                cloverDeviceConnectionConfiguration = getDeviceConfigurationForNetwork(Object.assign({}, baseConfiguration, networkConfiguration), parentComponent);
            } else {
                Logger.log(LogLevel.TRACE, `Device Connection:  Connecting via the Cloud.`);
                if (!legacy) {
                    cloverDeviceConnectionConfiguration = getDeviceConfigurationForCloud(Object.assign({}, baseConfiguration, {
                        "accessToken": connectorConfig.accessToken,
                        "cloverServer": connectorConfig.cloverServer,
                        "httpSupport": clover.HttpSupport ? new clover.HttpSupport(XMLHttpRequest) : null,
                        "merchantId": connectorConfig.merchantId,
                        "deviceId": connectorConfig.deviceId,
                        "friendlyId": "Automated Test"
                    }));
                } else {
                    cloverDeviceConnectionConfiguration = {
                        "remoteApplicationId": connectorConfig.applicationId,
                        "clientId": connectorConfig.clientId,
                        "domain": connectorConfig.cloverServer,
                        "oauthToken": connectorConfig.accessToken,
                        "deviceId": connectorConfig.deviceId,
                        "merchantId": connectorConfig.merchantId,
                        "friendlyId": connectorConfig.friendlyId,
                    }
                }
            }
            const builderConfiguration = {};
            if (!legacy) {
                builderConfiguration[clover.CloverConnectorFactoryBuilder.FACTORY_VERSION] = clover.CloverConnectorFactoryBuilder.VERSION_12;
                const cloverConnectorFactory = clover.CloverConnectorFactoryBuilder.createICloverConnectorFactory(builderConfiguration);
                cloverConnector = cloverConnectorFactory.createICloverConnector(cloverDeviceConnectionConfiguration);
            } else {
                cloverConnector = new clover.CloverConnectorFactory().createICloverConnector(cloverDeviceConnectionConfiguration);
            }
            defaultListener = buildCloverConnectionListener(cloverConnector, connectionInitializedDeferred);
            this.setListener(defaultListener);
            cloverConnector.initializeConnection();

            const connectorReadyTimeout = testConfig["connectorReadyTimeout"] || 15000;
            // If the connection is not established in testConfig["connectorReadyTimeout"] millis, timeout and reject.
            setTimeout(() => connectionInitializedDeferred.reject(504), connectorReadyTimeout);
            return connectionInitializedDeferred.promise();
        },

        closeConnection: function () {
            if (cloverConnector != null) {
                Logger.log(LogLevel.INFO, "Closing Clover Connector.");
                if (currentListener != null) {
                    cloverConnector.removeCloverConnectorListener(currentListener);
                    currentListener = null;
                }
                cloverConnector.dispose();
                cloverConnector = null;
            }
        },

        getCloverConnector: function () {
            return cloverConnector;
        },

        getListener: function() {
            return currentListener;
        },

        /**
         * We only want one listener, since we are going to be re-setting listeners in a few places we will manage
         * everything here.
         *
         * @param listenerToSet
         */
        setListener: function(listenerToSet) {
            if (cloverConnector) {
                if (currentListener) {
                    cloverConnector.removeCloverConnectorListener(currentListener);
                }
                cloverConnector.addCloverConnectorListener(listenerToSet);
                currentListener = listenerToSet;
            }
        },

        restoreListener: function() {
            this.setListener(defaultListener);
        }

    };

    // Private Members

    let cloverConnector = null;
    let currentListener = null;
    let defaultListener = null;
    let authToken = null;

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
    function buildCloverConnectionListener(cloverConnector, connectionInitializedDeferred) {
        return Object.assign({}, sdk.remotepay.ICloverConnectorListener.prototype, testCloverConnectorListener.create(cloverConnector), {

            // For legacy support
            onReady: function(merchantInfo) {
                this.onDeviceReady(merchantInfo);
            },

            onDeviceReady: function (merchantInfo) {
                Logger.log(LogLevel.INFO, {message: "Device Ready to process requests!", merchantInfo: merchantInfo});
                connectionInitializedDeferred.resolve("Device Ready");
            }
        });
    };

    function getDeviceConfigurationForCloud(connectionConfiguration) {
        return new clover.WebSocketCloudCloverDeviceConfiguration(
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
        let deviceConfiguration = new clover.WebSocketPairedCloverDeviceConfiguration(
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
                EventService.get().pairingObservable.next(pairingCodeMessage);

            },
            onPairingSuccess: function (authToken) {
                Logger.log(LogLevel.INFO, `    >  Got Pairing Auth Token: ${authToken}`);
                EventService.get().pairingObservable.next(undefined);

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
