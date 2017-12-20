import "whatwg-fetch";
import * as cloverConnectorTestManager from "./CloverConnectorTestManager";
import {LogLevel, Logger} from "./util/Logger";

const create = () => {
    return {

        /**
         * Fire off the test engine.  This function can be used to manually run tests (outside of the automater UI).
         *
         * @param testConfig
         */
        loadAndRunTests: function (testConfig) {
            if (validateTestConfig(testConfig)) {
                this.loadTests(testConfig)
                    .then((response) => response.json())
                    .then((testDefinitionResponse) => {
                        if (validateTestDefinitionResponse(testDefinitionResponse)) {
                            const testCases = testDefinitionResponse["testCases"];
                            const testCasesToRun = lodash.map(testCases, (testCase) => testCase);
                            print(JSON.stringify(testCasesToRun));
                            //const testCasesToRun = [testCases["infuse_test.json"]];
                            cloverConnectorTestManager.create().execute(testConfig, testCasesToRun);
                        }
                });
            } else {
                Logger.log(LogLevel.ERROR, "Failure.  The tests could not be executed the configuration is not valid.");
            }
        },

        /**
         * Loads the test definitions returns a Promise.
         *
         * @returns {*}
         */
        loadTests: function (testConfig) {
            if (testConfig && testConfig.definitionEndpoint) {
                return fetch(testConfig.definitionEndpoint)
                    .catch((xhr, status, message) => {
                        message = message || "Is the test-definitions REST service up?";
                        Logger.log(LogLevel.ERROR, `Failure: An error has occurred and the test definitions could not be loaded: Details: ${message}`);
                    });
            } else {
                Logger.log(LogLevel.ERROR, "Failure: Cannot load test definitions.  Either no test configuration exists or a definitionEndpoint is not specified on the test configuration.");
            }
        },

        /**
         * Validate that the response from retrieving the test-definitions is valid.
         *
         * @param testDefinitionResponse
         * @returns {boolean}
         */
        validateTestDefinitionResponse: function (testDefinitionResponse) {
            if (!testDefinitionResponse || testDefinitionResponse.status !== "success") {
                Logger.log(LogLevel.ERROR, `Failure: An error occurred retrieving the test definitions: Details: ${testDefinitionResponse.message}`);
                return false;
            }
            return true;
        }
    }

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
    }

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
    }

};

export {create};




