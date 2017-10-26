import {JSONToCustomObject} from "../../../dist/com/clover/json/JSONToCustomObject";
import * as exchangeConstants from "./ExchangeConstants";
import {LogLevel, Logger} from "./util/Logger";
import * as testUtils from "./util/TestUtils";

const create = (action, actionCompleteDeferred, testConnector, storedValues) => {

    let resultDeferred = null;
    let cloverConnector = testConnector.getCloverConnector();
    let delay = lodash.get(action, ["parameters", "delay"], 0);
    let responseTimeout = lodash.get(action, ["parameters", "responseTimeout"], 30000);
    let waitForResponse = lodash.get(action, ["parameters", "waitForResponse"], true);
    if (action.response != null) {
        waitForResponse = true;
    }

    return {
        executeAction: function () {
            const executeActionDeferred = new jQuery.Deferred();

            // Record request time
            action.result = {};
            action.result.requestTime = new Date();

            // Wait for a delay, if any
            if (delay > 0) {
                setTimeout(() => {
                    executeActionInternal()
                        .then((action) => {
                            executeActionDeferred.resolve(action);
                        });
                }, delay);
            } else {
                executeActionInternal()
                    .then((action) => {
                        executeActionDeferred.resolve(action);
                    });
            }
            return executeActionDeferred;
        },

        /**
         * Processes the response from the device.
         *
         * @param remoteMethod
         * @param remoteResponse
         */
        processResult: function (remoteMethod, remoteResponse) {
            const expectedActionResponse = lodash.get(action, ["assert", "response"]);
            if (expectedActionResponse && expectedActionResponse.method === remoteMethod) {
                Logger.log(LogLevel.info, `Processing response ${remoteMethod}`);
                if (waitForResponse) {
                    action.result.responseTime = new Date();
                }

                const responseError = lodash.get(remoteResponse, "result", "") === "FAIL" || !lodash.get(remoteResponse, "success", true);
                if (responseError) {
                    action.result.pass = false;
                    action.result.message = remoteResponse["message"] || remoteResponse["reason"] || `A failure occurred processing ${action.name}.`;
                }

                if (!responseError) {
                    try {
                        processResultInternal(remoteResponse, expectedActionResponse.payload);
                    } catch (e) {
                        handleActionFailure(`An error has occurred processing the result. Details: ${e.message}`, true);
                    }

                    const store = lodash.get(expectedActionResponse, "store");
                    if (store) {
                        try {
                            for (let key in store) {
                                storeResult(remoteResponse[key], store[key]);
                            }
                        } catch (e) {
                            Logger.log(LogLevel.ERROR, "Error storing results");
                        }
                    }

                    const responseError = lodash.get(remoteResponse, "result", "") === "FAIL" || !lodash.get(remoteResponse, "success", true);
                    if (responseError) {
                        action.result.pass = false;
                        action.result.message = remoteResponse["message"] || remoteResponse["reason"] || `A failure occurred processing ${action.name}.`;
                    } else {
                        if (action.result.pass !== false) {
                            action.result.pass = true;
                        }
                    }
                }

                // Resolve the responses deferred.
                if (resultDeferred) {
                    Logger.log(LogLevel.Info, `Action ${action.result.pass} and ${action.result.message}.`);
                    resultDeferred.resolve();
                }
            }
        },

        /**
         * Processes device events, executing actions for any input options specified in the test case.
         *
         * @param event
         */
        processDeviceEvent: function (event) {
            const inputOptions = lodash.get(action, ["context", "inputOptions"], null);
            if (inputOptions) {
                let option = lodash.find(inputOptions, ['on', event.getEventState()]);
                if (option) {
                    option.description = option.description || option.select;
                    if (option.method) {
                        executeRequest(option.method, option.response);
                    } else {
                        if (option.keyPress == null) {
                            // No keypress specified...derive from inputs
                            const pattern = new RegExp(option.description || option.select);
                            const eventOptions = event.getInputOptions();
                            option = null;
                            eventOptions.some((eventOption) => {
                                if (pattern.exec(eventOption.description)) {
                                    option = eventOption;
                                    return true;
                                }
                            });
                        }
                        if (option != null) {
                            cloverConnector.invokeInputOption(option);
                        }
                    }
                }
            }
        },

        confirmPaymentChallenge: function (name) {
            const deviceRequests = lodash.get(action, ["context", "deviceRequests"]);
            if (deviceRequests) {
                const confirmMappings = deviceRequests.paymentConfirmation;
                if (confirmMappings != null && "REJECT" === confirmMappings[name]) {
                    return false;
                }
            }
            // Accept by default
            return true;
        },

        acceptSignature: function () {
            const deviceRequests = lodash.get(action, ["context", "deviceRequests"]);
            if (deviceRequests && "REJECT" === deviceRequests.signatureVerification) {
                return false;
            }
            // Accept by default
            return true;
        }
    };

    /**
     * Executes the action.
     */
    function executeActionInternal() {
        const executeActionDeferred = new jQuery.Deferred();
        resultDeferred = new jQuery.Deferred();
        if (executeRequest()) {
            if (waitForResponse) {
                resultDeferred.promise().then(() => {
                    executeActionDeferred.resolve();
                });
            } else {
                executeActionDeferred.resolve();
            }
        } else {
            executeActionDeferred.resolve();
        }
        // If a responseTimeout has been set for the action and a response has not been received within the timeout
        // indicate a failure on the action's result.
        if (responseTimeout && responseTimeout > 0) {
            setTimeout(() => {
                if (resultDeferred.state === "pending") {
                    handleActionFailure(`Timeout: A response was not received within ${responseTimeout} milli(s).`);
                    executeActionDeferred.resolve();
                }
            }, responseTimeout);
        }
        return executeActionDeferred.promise();
    }

    /**
     * Executes a request to the Clover Connector for the specified action.
     *
     * @param action
     * @returns {boolean}
     */
    function executeRequest() {
        const requestFromActionDefinition = lodash.get(action, ["context", "request"]);
        const methodFromActionDefinition = lodash.get(requestFromActionDefinition, "method");
        // See the resolveRequestParameters function for an explanation of the purpose of methodMapping.
        const methodMapping = exchangeConstants.create().testActionToRemoteCall[methodFromActionDefinition];
        if (methodMapping) {
            const payload = resolveRequestParameters(requestFromActionDefinition, methodMapping);
            const methodToCall = lodash.get(methodMapping, "method");
            Logger.log(LogLevel.INFO, `Executing remote request, method: ${methodFromActionDefinition}.`);
            if (!methodToCall) {
                const message = `Test Failure: Unsupported method type: ${method}`;
                handleActionFailure(message, true);
                return false;
            }
            cloverConnector[methodToCall](payload);
            return true;
        } else {
            const message = `Test Failure: A mapping for method ${methodFromActionDefinition} was not found in ExchangeConstants.requestDefToMethod.`;
            handleActionFailure(message, true);
            return false;
        }
    };

    /**
     *  The request payload in the test definition is defined as JSON.  The SDK works with JavaScript objects
     *  from remote-pay-cloud-api that have meta-data. The correct types need to be created from the test case JSON.
     *  This method uses a simple mapping (ExchangeConstants.testActionToRemoteCall) to properly build the remote-pay-cloud-api
     *  JavaScript Objects.
     */
    function resolveRequestParameters(requestFromActionDefinition, methodMapping) {
        const request = lodash.get(action, ["context", "request"]);
        const payloadResolver = lodash.get(methodMapping, "payloadResolver");
        let payload = lodash.get(request, "payload", {});
        if (payloadResolver) {
            if (lodash.isArray(payloadResolver)) {
                payload = payloadResolver.map(() => resolveRequestParameter(requestFromActionDefinition, payloadResolver))
            } else if (lodash.isFunction(payloadResolver)) {
                payload = payloadResolver(payload);
            } else {
                payload = resolveRequestParameter(requestFromActionDefinition, payloadResolver);
            }
        }
        // No payloadResolver, return parameters as they exist in the test cases request.
        return payload;
    };

    /**
     * See resolveRequestParameters
     *
     * @param requestFromActionDefinition
     * @param payloadResolver
     */
    function resolveRequestParameter(requestFromActionDefinition, payloadResolver) {
        const key = lodash.get(payloadResolver, "key");
        const type = lodash.get(payloadResolver, "type");
        let payload = resolveStoredValues(lodash.get(requestFromActionDefinition, key || "payload"));
        if (type) {
            // payloadResolver.type is a reference to the constructor of the SDK class type.
            const sdkClassConstructorRef = lodash.bind(payloadResolver.type, this);
            // Create a new instance of the sdk class.
            const sdkClass = new sdkClassConstructorRef;
            // Transfers values from payload into the SDK class.
            new JSONToCustomObject().transfertoObject(payload, sdkClass, true);
            payload = sdkClass;
        }
        return payload;
    };

    function resolveStoredValues(payload) {
        // If payload is null or undefined so be it.  Passing an empty object to the clover connector
        // when it is expecting null/undefined will cause problems.
        const resolved = payload ? {} : null;
        if (payload) {
            for (let key in payload) {
                resolved[key] = resolveStoredValue(payload[key]);
            }
        }
        return resolved;
    };

    function resolveStoredValue(element) {
        if (lodash.isString(element)) {
            if (lodash.startsWith(element, "$:")) {
                // Value is populated from a stored variable
                const storedValueKey = element.substring(2);
                const storedValue = storedValues[storedValueKey];
                if (!storedValue) {
                    const message = `A stored value for ${storedValueKey} was not found.`;
                    handleActionFailure(message, true);
                }
                return storedValue || "";
            } else if (lodash.startsWith(element, "#:")) {
                //  Value is populated from a function
                const storedValueFunction = element.substring(2);
                const testUtilsIn = testUtils.create();
                if (storedValueFunction === "GEN_EXT_ID") {
                    return testUtilsIn.getNextId();
                }
            }
            // Just use the existing value
            return element;
        } else if (lodash.isObject(element)) {
            return resolveStoredValue(element);
        } else if (lodash.isArray(element)) {
            return element.map((arrElement) => resolveStoredValue(arrElement));
        } else if (lodash.isNumber(element)) {
            return element;
        }
    };

    /**
     * Validate the actual response against the expected response.
     *
     * @param remoteResponse
     * @param expectedResponse
     */
    function processResultInternal(remoteResponse, expectedResponse) {
        for (let key in expectedResponse) {
            let expectedElement = expectedResponse[key];
            const remoteElement = remoteResponse[key];
            if (!lodash.isObject(expectedElement)) {
                if (remoteElement) {
                    if (!expectedElement) {
                        handleActionFailure(`Expected value = null; Actual value = ${remoteElement}`);
                    } else if (expectedElement !== "*") {
                        // expected is not null or a wildcard
                        if (lodash.startsWith(expectedElement, "$:")) {
                            // Target is actually a stored variable
                            const storedValue = storedValues[expectedElement.substring(2)];
                            if (!storedValue) {
                                handleActionFailure(`Cannot resolve expected value = ${expectedElement}; Actual value = ${resultElement}`);
                                continue;
                            } else if (lodash.isObject(storedValue) || lodash.isArray(storedValue)) {
                                handleActionFailure(`Cannot resolve expected value [not a primitive] = ${expectedElement}; Actual value = ${remoteElement}`);
                                continue;
                            }
                            expectedElement = storedValue;
                        }
                        // should match
                        if (expectedElement !== remoteElement) {
                            handleActionFailure(`${key} - Expected value = ${expectedElement}; Actual value = ${remoteElement}`);
                        }
                    }
                } else if (expectedElement != null) {
                    // Result is null, and expected is not null
                    handleActionFailure(`${key} - Expected value = ${expectedElement}; Actual value = null`);
                }
            } else {
                processResultInternal(remoteElement, expectedElement);
            }
        }
    };

    function storeResult(valueFromResponse, templateValueFromTestCase) {
        if (!valueFromResponse) {
            Logger.log(LogLevel.ERROR, `No result for storedValue key: ${templateValueFromTestCase}`);
            return;
        }
        if (!lodash.isObject(templateValueFromTestCase) && !lodash.isArray(templateValueFromTestCase)) {
            storedValues[templateValueFromTestCase] = valueFromResponse;
        } else if (lodash.isObject(templateValueFromTestCase)) {
            if (!lodash.isObject(valueFromResponse)) {
                Logger.log(LogLevel.ERROR, `"Invalid result [Object Expected] for storedValue key: ${templateValueFromTestCase}`);
                return;
            }
            for (let key in templateValueFromTestCase) {
                storeResult(valueFromResponse[key], templateValueFromTestCase[key]);
            }
        }
    };

    function handleActionFailure(message, log = false) {
        testUtils.create().handleActionFailure(action, message, log);
        resultDeferred.resolve();
    };

};

export {create}