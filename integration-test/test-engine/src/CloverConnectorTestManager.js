import * as RSVP from "rsvp";
import * as testExecutor from "./TestExecutor";
import * as testConnector from "./TestConnector";
import * as iterable from "./util/Iterable";
import {LogLevel, Logger} from "./util/Logger";
import EventService from "./EventService"

const create = () => {
    return {
        execute: function (testConfig, testCases) {
            const connectorConfigs = testConfig["connectorConfigs"];
            // Create a test connector for each configuration.
            const testConnectors = connectorConfigs.map((connectorConfig) => testConnector.create(connectorConfig));
            const testCaseItr = iterable.makeIterator(testCases);
            // Initialize the testConnectors, continue when they are paired and ready to process requests.
            testConnectors.forEach((testConnector) => {
                testConnector.initializeConnection(testConfig)
                    .then(() => {
                        const testCaseItr = iterable.makeIterator(testCases);
                        runTests(testConfig, testCaseItr, testConnector);
                    })
                    .catch((error) => {
                        handleDeviceFailure(error, testConnector);
                    });
            });
        }
    };

    // Private members

    /**
     * Entry point for test case execution, jQuery deferred/promise is used to enforce this serial execution.
     *
     * @param testConfig
     * @param testCaseItr
     * @param testConnector
     */
    function runTests(testConfig, testCaseItr, testConnector) {
        // Iterate through the test cases serially.
        if (testCaseItr.hasNext()) {
            const testCase = testCaseItr.next().value;
            prepareAndRunTest(testCase, testConnector, testConfig).then(() => runTests(testConfig, testCaseItr, testConnector));
        } else {
            testConnector.closeConnection();
            Logger.log(LogLevel.INFO, "All test cases have been executed.");
        }
    }

    /**
     * Makes sure that the Clover Connector is ready to process requests
     * then runs each test.
     *
     * @param testCase
     * @param testConnector
     * @param testConfig
     */
    function prepareAndRunTest(testCase, testConnector, testConfig) {
        Logger.log(LogLevel.INFO, `Running test '${testCase.name}' ...`);
        const testCompleteDeferred = RSVP.defer();
        testConnector.initializeConnection(testConfig).then(() => runTest(testCompleteDeferred, testCase, testConnector));
        // If the test has not been completed in testConfig["testExecutionTimeout"] millis, timeout and reject.
        const testExecutionTimeout = testConfig["testExecutionTimeout"] || 15000;
        setTimeout(() => testCompleteDeferred.reject(504), testExecutionTimeout);
        return testCompleteDeferred.promise;
    }

    /**
     * Runs each test (all actions), testCompleteDeferred doesn't resolve until all test actions have completed.
     *
     * @param testCompleteDeferred
     * @param testCase
     * @param testConnector
     */
    function runTest(testCompleteDeferred, testCase, testConnector) {
        const run = () => {
            const resultCache = {};
            const iterations = lodash.get(testCase, "iterations", 1);
            let allTestActions = [];
            // Populate test actions for each iteration.
            for (let i = 0; i < iterations; i++) {
                let nextIterationTestActions = testCase.testActions;
                nextIterationTestActions.name += i;
                allTestActions = allTestActions.concat(nextIterationTestActions);
            }
            const actionItr = iterable.makeIterator(allTestActions);
            testExecutor.create(resultCache, testConnector, testCase).executeActions(actionItr)
            // actionResults is an array of all actions that were executed. The 'result' property on each
            // action result contains the status information for that action.
                .then((actionResults) => {
                    Logger.log(LogLevel.TRACE, actionResults);
                    EventService.testObservable.next({
                        name: testCase.name,
                        testActions: actionResults
                    });
                    // If there is a delay between test executions
                    const delayBetween = lodash.get(testCase, "delayBetweenExecutions", 0);
                    if (delayBetween > 0) {
                        setTimeout(() => completeTest(testCompleteDeferred, testCase, testConnector), delayBetween);
                    } else {
                        completeTest(testCompleteDeferred, testCase, testConnector);
                        completeTest(testCompleteDeferred, testCase, testConnector);
                    }
                });
        };
        // Reset device (if necessary)
        const resetDevice = lodash.get(testCase, "resetDevice", false);
        if (resetDevice) {
            // Save the current onResetDeviceResponse function, so that we can reset it after a response has been received.
            const savedResetDeviceResponseHandler = testConnector.getListener().onResetDeviceResponse;
            // Reset the device on failure.
            testConnector.getListener().onResetDeviceResponse = () => {
                const testConnectorListener = testConnector.getListener();
                if (testConnectorListener) {
                    testConnector.getListener().onResetDeviceResponse = savedResetDeviceResponseHandler;
                }
                run();
            };
            testConnector.getCloverConnector().resetDevice();
        } else {
            run();
        }
    }

    /**
     * Test clean-up utility. Resolves testCompleteDeferred when all actions have been completed.
     *
     * @param testCompleteDeferred
     * @param testCase
     * @param testConnector
     */
    function completeTest(testCompleteDeferred, testCase, testConnector) {
        // Dispose the connector and reinitialize if dispose flag is set
        const disposeBetweenExecutions = lodash.get(testCase, "disposeBetweenExecutions", false);
        if (disposeBetweenExecutions) {
            testConnector.closeConnection();
        }
        testCompleteDeferred.resolve();
    }

    function handleDeviceFailure(code, testConnector) {
        const message = (code === 504) ? "Timed-out initializing a connection to the device" : "An error has occurred establishing a connection to the device";
        Logger.log(LogLevel.ERROR, `Device Connection Failure: ${message}.  The connection is being closed and no tests will be run on this device.`);
        testConnector.closeConnection();
        if (code === 504) {
            EventService.pairingObservable.next(message);
        }
    }

};

export {create}