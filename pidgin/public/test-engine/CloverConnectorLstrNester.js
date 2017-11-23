import * as cloverConnectorTestManager from "./CloverConnectorTestManager";
import {LogLevel, Logger} from "./util/Logger";

const create = () => {
    return {

        /**
         * Fire off the test engine.
         *
         * @param testConfig
         */
        nestAndTest: function (testConfig) {
            if (!testConfig || Object.keys(testConfig).length === 0) {
                // try looking at the testConfig.json file.
                jQuery.ajax({
                    type: "GET",
                    url: "../testConfig.json",
                    error: (xhr, status, message) => {
                        Logger.log(LogLevel.ERROR, `Failure: An error has occurred and the connection configuration could not be loaded: Details ${message}.`);
                    }
                }).done(testConfig => {
                    loadAndRunTests(testConfig);
                });
            } else {
                loadAndRunTests(testConfig);
            }
        }

    }

    // Private members

    function loadAndRunTests(testConfig) {
        if (validateTestConfig(testConfig)) {
            loadTests(testConfig).done((testDefinitionResponse) => {
                if (validateTestDefinitionResponse(testDefinitionResponse)) {
                    const testCases = testDefinitionResponse["testCases"];
                    //const testCasesToRun = lodash.map(testCases, (testCase) => testCase);
                    const testCasesToRun = [testCases["refund2.json"]];
                    cloverConnectorTestManager.create().execute(testConfig, testCasesToRun);
                }
            });
        } else {
            Logger.log(LogLevel.ERROR, "Failure.  The tests could not be executed the configuration is not valid.");
        }
    };

    /**
     * Validates that the test config is valid.
     *
     * @param testConfig
     * @returns {boolean}
     */
    function validateTestConfig(testConfig) {
        let isValid = true;
        const connectorConfigs = testConfig["connectorConfigs"];
        if (!connectorConfigs && lodash.isArray(connectorConfigs)) {
            Logger.log(LogLevel.ERROR, "Failure: The test configuration must contain a connectorConfigs property which is an array.");
            isValid = false;
        }
        connectorConfigs.forEach((connectorConfig) => {
            if (!validateConnectorConfig(connectorConfig)) {
                isValid = false;
            }
        });
        return isValid;
    };

    /**
     * Validates that each connector config. within the test config is valid.
     *
     * @param connectorConfig
     * @returns {boolean}
     */
    function validateConnectorConfig(connectorConfig) {
        let isValid = true;
        if (!lodash.isObject(connectorConfig)) {
            Logger.log(LogLevel.ERROR, "Failure: Connector configurations must be objects.");
            isValid = false;
        }
        const connectorConfigType = lodash.get(connectorConfig, "type");
        if (!lodash.has(connectorConfig, "type") || ["cloud", "network"].indexOf(connectorConfigType) < 0) {
            Logger.log(LogLevel.ERROR, "Failure: Connector configuration objects must contain a type and the type must be 'network' or 'cloud'.");
            isValid = false;
        }
        if (connectorConfigType === "cloud") {
            const requiredCloudConfigProps = ["applicationId", "accessToken", "cloverServer", "merchantId", "deviceId"];
            requiredCloudConfigProps.forEach((requiredCloudConfigProp) => {
                if (!lodash.has(connectorConfig, requiredCloudConfigProp)) {
                    Logger.log(LogLevel.ERROR, `Failure: Cloud configuration objects must define the ${requiredCloudConfigProp} property.`);
                    isValid = false;
                }
            });
        }
        if (connectorConfigType === "network") {
            const requiredNetworkConfigProps = ["applicationId", "wsScheme", "ipAddress", "wsPort"];
            requiredNetworkConfigProps.forEach((requiredNetworkConfigProp) => {
                if (!lodash.has(connectorConfig, requiredNetworkConfigProp)) {
                    Logger.log(LogLevel.ERROR, `Failure: Network configuration objects must define the ${requiredNetworkConfigProp} property.`);
                    isValid = false;
                }
            });
        }
        return isValid;
    };

    /**
     * Validate that the response from retrieving the test-definitions is valid.
     *
     * @param testDefinitionResponse
     * @returns {boolean}
     */
    function validateTestDefinitionResponse(testDefinitionResponse) {
        if (!testDefinitionResponse || testDefinitionResponse.status !== "success") {
            Logger.log(LogLevel.ERROR, `Failure: An error occurred retrieving the test definitions: Details: ${testDefinitionResponse.message}`);
            return false;
        }
        return true;
    };

    /**
     * Loads the test definitions returns a Promise.
     *
     * @returns {*}
     */
    function loadTests(testConfig) {
        if (testConfig && testConfig.definitionEndpoint) {
            // JQuery provided globally via a webpack plugin - https://stackoverflow.com/questions/40035976/how-to-configure-and-use-jquery-with-webpack
            return jQuery.ajax({
                type: "GET",
                url: testConfig.definitionEndpoint,
                error: (xhr, status, message) => {
                    message = message || "Is the test-definitions REST service up?";
                    Logger.log(LogLevel.ERROR, `Failure: An error has occurred and the test definitions could not be loaded: Details: ${message}`);
                }
            });
        } else {
            Logger.log(LogLevel.ERROR, "Failure: Cannot load test definitions.  Either no test configuration exists or a definitionEndpoint is not specified on the test configuration.");
        }

    };
};

export {create}




