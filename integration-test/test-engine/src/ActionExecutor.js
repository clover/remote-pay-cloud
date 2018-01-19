import * as RSVP from "rsvp";
import * as sdk from "remote-pay-cloud-api";
import * as exchangeConstants from "./ExchangeConstants";
import {LogLevel, Logger} from "./util/Logger";
import * as testUtils from "./util/TestUtils";
import * as utils from "./util/Utils";
import ActionStatus from "./ActionStatus";

const create = (action, actionCompleteDeferred, testConnector, storedValues) => {

    // Resolved when the response assertions have been completed.
    let responseAssertionDeferred = RSVP.defer();
    // toggled to true when responseAssertionDeferred has resolved.
    let hasResponseAssertionDeferredResolved = false;

    // Resolved when the device event assertions have been completed.
    let deviceEventsAssertionDeferred = RSVP.defer();

    // All UI state events received during the execution of this action.
    const receivedDeviceEvents = [];

    const cloverConnector = testConnector.getCloverConnector();
    const delayBeforeExecution = lodash.get(action, ["parameters", "delayBeforeExecution"], 0);
    const responseTimeout = lodash.get(action, ["parameters", "responseTimeout"], 30000);

    let invokedInputOptionCount = 0;

    let waitForResponse = lodash.get(action, ["parameters", "waitForResponse"], true);
    if (action.response != null) {
        waitForResponse = true;
    }

    return {
        executeAction: function () {
            // Record request time
            if (!action.result) {
                action.result = {};
            }

            action.result.requestTime = new Date();

            // Wait for a delay, if any, and then begin execution.
            setTimeout(() => {
                executeActionInternal();
            }, delayBeforeExecution);

            return RSVP.all([
                responseAssertionDeferred.promise,
                deviceEventsAssertionDeferred.promise
            ]);
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

                const expectSuccess = lodash.get(expectedActionResponse, ["payload", "success"]);
                let responseError = false;
                if (expectSuccess) {
                    responseError = lodash.get(remoteResponse, "result", "") === "FAIL" || !lodash.get(remoteResponse, "success", true);
                    if (responseError) {
                        handleActionFailure(`A failure occurred processing the response for action: ${action.name}.  Details: ${JSON.stringify(remoteResponse)}.`, false, true);
                    }
                }

                if (!responseError) {
                    try {
                        assertResult(remoteResponse, expectedActionResponse.payload);
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

                    if (action.result.status !== ActionStatus.fail) {
                        action.result.status = ActionStatus.pass;
                    }

                    // Resolve the responses deferred.
                    if (responseAssertionDeferred) {
                        resolveResponseAssertionDeferred();
                    }
                }
                Logger.log(LogLevel.Info, `Action ${action.name} has completed, status: ${action.result.status}.`);
            } else if (expectedActionResponse && expectedActionResponse.method !== remoteMethod) {
                handleActionFailure(`Expected method ${expectedActionResponse.method} does not equal actual method ${remoteMethod}.`, true);
                // Resolve the responses deferred.
                if (responseAssertionDeferred) {
                    resolveResponseAssertionDeferred();
                }
            } else {
                Logger.log(LogLevel.INFO, "processResult - expectedActionResponse is null or undefined.");
            }
        },

        /**
         * Processes activity start events from the device, invoking any input options specified in the test case if matches are found.
         *
         * @param deviceEvent
         */
        processDeviceActivityStart: function (deviceEvent) {
            pushDeviceEvent(deviceEvent);
            const testDefInputOptions = getInputOptions();
            if (testDefInputOptions) {
                let testDefInputOption = lodash.find(testDefInputOptions, (input) => {
                    const pattern = new RegExp(input.on);
                    if (pattern.exec(deviceEvent.getEventState())) {
                        Logger.log(LogLevel.INFO, `Input option found: ${deviceEvent.getEventState()} matches ${input.on}.`);
                        return true;
                    }
                });
                if (testDefInputOption) {
                    testDefInputOption.description = testDefInputOption.description || testDefInputOption.select;
                    const eventOptions = deviceEvent.getInputOptions();
                    if (eventOptions) {
                        let inputOption = null;
                        // Find the matching input option from the device event.
                        // Find the matching input option from the device event.
                        eventOptions.some((eventOption) => {
                            if (testDefInputOption.select === eventOption.keyPress) {
                                inputOption = eventOption;
                                return true;
                            } else if (testDefInputOption.method) {
                                inputOption = null;
                                cloverConnector[testDefInputOption.method](eventOption);
                                return true;
                            } else {
                                let pattern = new RegExp(testDefInputOption.description);
                                if (pattern.exec(eventOption.description)) {
                                    inputOption = eventOption;
                                    return true;
                                }
                            }
                        });
                        if (inputOption) {
                            cloverConnector.invokeInputOption(inputOption);
                            invokedInputOptionCount++;
                        } else {
                            Logger.log(LogLevel.warn, `No matching input option found for ${JSON.stringify(testDefInputOption)}`);
                            if (performDeviceEventAssertion()) {
                                handleActionFailure(`Device assertions could not be performed because an input option could not be found.  Device Event: ${JSON.stringify(deviceEvent)}, Input Option not found: ${JSON.stringify(testDefInputOption)}`, false, true);
                            }
                        }
                    }
                }
            }
            // Once all of the input options have been invoked, assert the device events. Call with a
            // delay to allow the invocation of the input option to execute on the device.
            if (performDeviceEventAssertion()) {
                if (!testDefInputOptions || (invokedInputOptionCount === testDefInputOptions.length)) {
                    setTimeout(() => assertDeviceEvents(), 2500);
                }
            }
        },

        processDeviceActivityEnd(deviceEvent) {
            pushDeviceEvent(deviceEvent, false);
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
    }

    /**
     * Executes the action.
     */
    function executeActionInternal() {
        // A response assertion was not specified in the test-case, resolve the response assertion deferred, there is no work to be done.
        if (!performResponseAssertion()) {
            resolveResponseAssertionDeferred();
        }

        // A device assertion was not specified in the test-case, resolve the device event assertion deferred, there is no work to be done.
        if (!performDeviceEventAssertion()) {
            deviceEventsAssertionDeferred.resolve();
        }

        // Execute the request on the Clover Connector.
        executeRequest();

        // If we aren't waiting for a response, or if there is nothing to assert on, set the status and resolve responseAssertionDeferred.
        if (!waitForResponse || (!performResponseAssertion() && !performDeviceEventAssertion())) {
            action.result.status = ActionStatus.manual;
            resolveResponseAssertionDeferred();
        }

        // If a responseTimeout has been set for the action and a response has not been received within the timeout indicate a failure on the action's result.
        if (performResponseAssertion() && responseTimeout && responseTimeout > 0) {
            setTimeout(() => {
                if (isDeferredPending(responseAssertionDeferred)) {
                    handleActionFailure(`Timeout: A response was not received within ${responseTimeout} milli(s).`, false, true);
                }
            }, responseTimeout);
        }
    }

    function performResponseAssertion() {
        return lodash.get(action, ["assert", "response"], null) != null;
    }

    function performDeviceEventAssertion() {
        return lodash.get(action, ["assert", "deviceEvent"], null) != null;
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
            // Store request values per the test definition.
            const store = lodash.get(requestFromActionDefinition, "store");
            if (store) {
                try {
                    for (let key in store) {
                        storeResult(payload[key], store[key]);
                    }
                } catch (e) {
                    Logger.log(LogLevel.ERROR, "Error storing results");
                }
            }
            const methodToCall = lodash.get(methodMapping, "method");
            Logger.log(LogLevel.INFO, `Executing remote request, method: ${methodFromActionDefinition}.`);
            if (!methodToCall) {
                const message = `Test Failure: Unsupported method type: ${method}`;
                handleActionFailure(message, true, true);
                return false;
            }
            cloverConnector[methodToCall](payload);
            return true;
        } else {
            const message = `Test Failure: A mapping for method ${methodFromActionDefinition} was not found in ExchangeConstants.requestDefToMethod.`;
            handleActionFailure(message, true, true);
            return false;
        }
    }

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
    }

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
            payload = Object.assign(sdkClass, payload);
        }
        return payload;
    }

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
    }

    function resolveStoredValue(element) {
        if (lodash.isString(element)) {
            if (lodash.startsWith(element, "$:")) {
                // Value is populated from a stored variable
                const storedValueKey = element.substring(2);
                const storedValue = storedValues[storedValueKey];
                if (!storedValue) {
                    const message = `A stored value for ${storedValueKey} was not found.`;
                    handleActionFailure(message, true, true);
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
        } else {
            return element;
        }
    }

    /**
     * Validate the actual response against the expected response.
     *
     * @param remoteResponse
     * @param expectedResponse
     */
    function assertResult(remoteResponse, expectedResponse) {
        for (let key in expectedResponse) {
            let expectedElement = expectedResponse[key];
            const remoteElement = remoteResponse[key];
            if (!lodash.isObject(expectedElement)) {
                if (expectedElement !== "*") {
                    // expected is not null or a wildcard
                    if (lodash.startsWith(expectedElement, "$:")) {
                        // Target is actually a stored variable
                        const storedValue = storedValues[expectedElement.substring(2)];
                        if (!storedValue) {
                            handleActionFailure(`${key}: Cannot resolve expected value = ${expectedElement}; Actual value = ${resultElement}`);
                            continue;
                        } else if (lodash.isObject(storedValue) || lodash.isArray(storedValue)) {
                            handleActionFailure(`${key}: Cannot resolve expected value [not a primitive] = ${expectedElement}; Actual value = ${remoteElement}`);
                            continue;
                        }
                        expectedElement = storedValue;
                    }
                    // should match
                    if (expectedElement !== remoteElement) {
                        handleActionFailure(`${key}: Expected value = ${expectedElement}; Actual value = ${remoteElement}`);
                    }
                } else if (!remoteElement) {
                    // Result is null, and expected is not null
                    handleActionFailure(`${key}: Expected value = ${expectedElement}; Actual value = null`);
                }
            } else {
                assertResult(remoteElement, expectedElement);
            }
        }
    }

    /**
     * Assert the device events, if the action has a "deviceEvent" assertion.
     */
    function assertDeviceEvents() {
        const eventTypeFilter = lodash.get(action, ["assert", "deviceEvent", "eventTypeFilter"], "ALL"); // Applies to count and flow, not exclusions
        const testActionDeviceEvents = lodash.get(action, ["assert", "deviceEvent", "flow", "events"], []);
        const flowComparisonType = lodash.get(action, ["assert", "deviceEvent", "flow", "comparisonType"], "STRICT");

        const assertUtils = utils.create();
        let actualDeviceEvents = [];
        // Filter the device events based on the test definition, e.g. we have only defined start or end events in our test def.
        if (eventTypeFilter !== "ALL") {
            actualDeviceEvents = lodash.filter(receivedDeviceEvents, (deviceEvent) => {
                if (eventTypeFilter === "START_ONLY" && deviceEvent.isStart) {
                    return true;
                }
                if (eventTypeFilter === "END_ONLY" && !deviceEvent.isStart) {
                    return true;
                }
                return false;
            });
        } else {
            actualDeviceEvents = receivedDeviceEvents.slice(0);
        }

        Logger.log(LogLevel.INFO, "Device Events received (filtered):");
        Logger.log(LogLevel.INFO, actualDeviceEvents);

        let deviceEventFlowFailed = false;
        if (testActionDeviceEvents && testActionDeviceEvents.length > 0) {
            // Assert the device event flow.
            if (flowComparisonType === "STRICT") {
                deviceEventFlowFailed = !assertUtils.match(testActionDeviceEvents, actualDeviceEvents);
            } else if (flowComparisonType === "ORDERED") {
                deviceEventFlowFailed = !assertUtils.containsSequence(testActionDeviceEvents, actualDeviceEvents);
            }
            if (deviceEventFlowFailed) {
                Logger.log(LogLevel.INFO, "Event flow defined in test definition:");
                Logger.log(LogLevel.INFO, testActionDeviceEvents);
                addMessageToResult(`The events received from the device during execution did not match the flow defined in the test definition.  Test Definition Events: ${JSON.stringify(testActionDeviceEvents)} Actual Device Events: ${JSON.stringify(actualDeviceEvents)}`);
            }
        }

        // Assert the device event exclusions
        let deviceEventExclusionsFailed = false;
        const testActionDeviceEventExclusions = lodash.get(action, ["assert", "deviceEvent", "exclusions"], []);
        if (testActionDeviceEventExclusions && testActionDeviceEventExclusions.length > 0) {
            deviceEventExclusionsFailed = testActionDeviceEventExclusions.some((exclusion) => {
                let matchFound = assertUtils.contains(receivedDeviceEvents, exclusion);
                if (matchFound) {
                    addMessageToResult(`An excluded device event was found: ${JSON.stringify(exclusion)}`);
                }
                return matchFound;
            });
        }

        // Assert the device event counts
        let deviceEventCountsFailed = false;
        const testActionDeviceEventCounts = lodash.get(action, ["assert", "deviceEvent", "counts"], []);
        if (testActionDeviceEventCounts && testActionDeviceEventCounts.length > 0) {
            testActionDeviceEventCounts.forEach((testActionDeviceEventForCount) => {
                let occurrences = assertUtils.occurrencesIn(actualDeviceEvents, testActionDeviceEventForCount, true);
                if(occurrences !== testActionDeviceEventForCount.count) {
                    addMessageToResult(`A device event count mismatch was found: Test Definition Event: ${JSON.stringify(testActionDeviceEventForCount)}`);
                    deviceEventCountsFailed = true;
                }
            });
        }

        if (deviceEventFlowFailed || deviceEventExclusionsFailed || deviceEventCountsFailed) {
            handleActionFailure();
        } else {
            if (action.result.status !== ActionStatus.fail) {
                action.result.status = ActionStatus.pass;
            }
            deviceEventsAssertionDeferred.resolve();
        }
    }

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
    }

    function addMessageToResult(message) {
        testUtils.create().addMessageToResult(action, message);
    }

    function handleActionFailure(message = null, log = false, reset = false) {
        testUtils.create().handleActionFailure(action, message, log);
        if (reset) {
            // Save the current onResetDeviceResponse function, so that we can reset it after a response has been received.
            const savedResetDeviceResponseHandler = testConnector.getListener().onResetDeviceResponse;
            testConnector.getListener().onResetDeviceResponse = (response) => {
                const testConnectorListener = testConnector.getListener();
                if (testConnectorListener) {
                    testConnector.getListener().onResetDeviceResponse = savedResetDeviceResponseHandler;
                }
                resolveResponseAssertionDeferred();
                deviceEventsAssertionDeferred.resolve();
            }
            cloverConnector.resetDevice();
            setTimeout(() => {
                lastDitchEffortToRecoverDeviceState();
            }, 2500);
        }
    }

    /**
     * See PAY-3924.  In the event that a device reset does not work this is a last ditch effort to get the device
     * into a working state (only supported on SDKs that support onDeviceActivityStart).  A device status call is
     * made with the sendLastMessage flag set to true, which will send the last UI event.  We handle this event and
     * attempt to select buttons to return to the payment screen (won't work with all flows) so that we can cancel
     * the payment and return to the welcome screen.
     */
    function lastDitchEffortToRecoverDeviceState() {
        if (isDeferredPending(responseAssertionDeferred)) {
            // RetrieveDeviceStatusRequest not available in all SDK versions.
            if (sdk.remotepay.RetrieveDeviceStatusRequest) {
                const listener = testConnector.getListener();
                if (listener) {
                    // Save the current onResetDeviceResponse function, so that we can reset it after a response has been received.
                    const savedOnDeviceActivityStart = listener.onDeviceActivityStart;
                    listener.onDeviceActivityStart = (response) => {
                        const eventOptions = lodash.get(response, "inputOptions", []);
                        if (eventOptions) {
                            const keysToPress = ["ENTER", "ESC"];
                            eventOptions.forEach((eventOption) => {
                                if (keysToPress.indexOf(eventOption.keyPress) > -1) {
                                    cloverConnector.invokeInputOption(eventOption);
                                    // If we are back on the payment screen, we are done!
                                    // The ESC input option will be invoked which will send the device to the welcome screen.
                                    if (lodash.startsWith(response.message, "Customer is choosing")) {
                                        listener.onDeviceActivityStart = savedOnDeviceActivityStart;
                                        // Pause a bit to allow the device to receive and redirect after receiving the input option.
                                        setTimeout(() => {
                                            resolveResponseAssertionDeferred();
                                            deviceEventsAssertionDeferred.resolve();
                                        }, 2500);
                                    }
                                }
                            });
                        }
                    }
                    const retrieveDeviceStatusRequest = new sdk.remotepay.RetrieveDeviceStatusRequest();
                    retrieveDeviceStatusRequest.setSendLastMessage(true);
                    cloverConnector.retrieveDeviceStatus(retrieveDeviceStatusRequest);
                }
            }
            setTimeout(() => {
                // Worst case, we couldn't execute input options to get the device in the correct state.
                // We are probably broken for future tests but we will continue.
                if (isDeferredPending(responseAssertionDeferred)) {
                    Logger.log(LogLevel.ERROR, "lastDitchEffortToRecoverDeviceState has failed.  The device is likely in a bad state and future tests will likely fail.");
                    resolveResponseAssertionDeferred();
                    deviceEventsAssertionDeferred.resolve();
                }
            }, 10000);
        }
    }

    function pushDeviceEvent(deviceEvent, startEvent = true) {
        deviceEvent.isStart = startEvent;
        receivedDeviceEvents.push(deviceEvent);
    }

    function isDeferredPending(deferred) {
        return !hasResponseAssertionDeferredResolved;
    }

    function resolveResponseAssertionDeferred() {
        hasResponseAssertionDeferredResolved = true;
        responseAssertionDeferred.resolve();
    }

    /**
     * For now, retrieves input options off of the action's context.  In the future this can pull/set
     * global input option overrides.
     */
    function getInputOptions() {
        return lodash.get(action, ["context", "inputOptions"], null);
    }

};

export {create}