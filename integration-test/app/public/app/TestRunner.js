import React from "react";
import Select2 from "react-select2-wrapper";
import "whatwg-fetch";
import * as Constants from "../Constants";
import Popup from "./components/Popup";
import ResultsGrid from "./components/ResultsGrid";

import {List, fromJS} from "immutable";
import {cloverConnectorTestManager, lstrNester, ActionStatus, EventService, Logger, LogLevel} from "test-engine";
import {Button, ButtonGroup, DropdownButton, MenuItem, Modal} from "react-bootstrap";

export default class TestRunner extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            testCases: ["loading..."],
            results: List(),
            testConfig: {}
        };

        this.constants = Constants.create();

        fetch("../testConfig.json")
            .then((response) => response.json()).then((testConfig) => {
            this.setState({
                testConfig: testConfig,
            });
            this.loadTests();
        }).catch((xhr, status, error) => {
            Logger.log(LogLevel.ERROR, `Failure: An error has occurred and the connection configuration could not be loaded: Details ${error}.`);
            this.state.noTestConfig = true;
        });

        this.savedTests = JSON.parse(window.localStorage.getItem(this.constants.localStorageSelectedTests));

        this.lNester = lstrNester.create();

        EventService.pairingObservable.subscribe(msg => {
            this.setState({
                pairingCodeMsg: msg
            });
        });

        this.runTests = this.runTests.bind(this);
        this.toggleSelections = this.toggleSelections.bind(this);
        this.onRunTestChange = this.onRunTestChange.bind(this);
        this.toggleTestConnectors = this.toggleTestConnectors.bind(this);
        this.handleTestNameChange = this.handleTestNameChange.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.loadConfig = this.loadConfig.bind(this);
        this.saveSelect2Selection = this.saveSelect2Selection.bind(this);
        this.loadTestsIntoSelect2 = this.loadTestsIntoSelect2.bind(this);
    }

    loadTests() {
        this.lNester.loadTests(this.state.testConfig)
            .then((response) => response.json())
            .then((testDefinitionResponse) => {
                if (this.lNester.validateTestDefinitionResponse(testDefinitionResponse)) {
                    this.testCases = testDefinitionResponse["testCases"];
                    const testCasesToRun = [];
                    lodash.forEach(this.testCases, (value, key) => {
                        testCasesToRun.push({
                            id: key,
                            text: value.name
                        });
                    });
                    this.setState({
                        testCases: testCasesToRun
                    });
                }
            });
    }

    onRunTestChange() {
        this.setState({
            results: this.getTestCasesToRun()
        });
    }

    toggleTestConnectors() {
        this.setState({
            displayConnectorConfig: !this.state.displayConnectorConfig
        });
    }

    handleTestNameChange(e) {
        this.testConfigName = e.target.value;
    }

    loadConfig() {
        // Get existing config and add to it
        let existingTestConfigs = window.localStorage.getItem(this.localStorageSelectedTests);
        if (existingTestConfigs) {
            this.loadTestsIntoSelect2(JSON.parse(existingTestConfigs));
        }
    }

    loadTestsIntoSelect2(tests) {
        this.refs.allTestCasesSelect2.el.val(tests).trigger('change');
    }

    saveSelect2Selection() {
        let testName = this.refs.testName.value;
        let currTests = JSON.parse(window.localStorage.getItem(this.constants.localStorageSelectedTests)) || {};
        currTests[testName] = this.selectedTestCasesToRun;
        window.localStorage.setItem(this.constants.localStorageSelectedTests, JSON.stringify(currTests));
        this.setState({
            displayModal: !this.state.displayModal
        });
    }

    toggleModal() {
        this.setState({
            displayModal: !this.state.displayModal
        });
    }

    runTests() {
        const testCasesToRun = this.getTestCasesToRun();

        // Reset the state so that results are cleared for each test run.
        this.setState({
            results: testCasesToRun
        });

        EventService.testObservable.subscribe(update => {
            // Update the results, if a test name match is found.
            // Currently, assumes there are no duplicate test names.
            const updatedResults = this.state.results.update(
                this.state.results.findIndex(function (item) {
                    return item.get("name") === update.name;
                }), function () {
                    update.result = {};
                    if (update.testActions) {
                        // Roll-up action status to the test.
                        for (let i = 0; i < update.testActions.length; i++) {
                            const action = update.testActions[i];
                            if (action.result) {
                                if (action.result !== ActionStatus.pass) {
                                    update.result.status = action.result.status;
                                    break;
                                }
                            } else {
                                update.result.status = ActionStatus.executing;
                                break;
                            }
                        }
                        if (!update.result.status) {
                            update.result.status = ActionStatus.pass;
                        }
                    }
                    return fromJS(update);
                }
            );
            this.setState({
                results: updatedResults
            });
        });

        cloverConnectorTestManager.create().execute(this.state.testConfig, testCasesToRun.toJS());
    }

    getTestCasesToRun() {
        this.selectedTestCasesToRun = this.refs.allTestCasesSelect2.el.val();
        return fromJS(lodash.map(this.selectedTestCasesToRun, (fileName) => {
            return this.testCases[fileName];
        }));
    }

    toggleSelections(event) {
        let selectedItems = [];
        if (event && event.target.checked) {
            selectedItems = jQuery(this.refs.allTestCasesSelect2.el).find('option').map(function () {
                return this.value
            });
        }
        this.refs.allTestCasesSelect2.el.val(selectedItems).trigger('change');
    }

    isTestConfigValid() {
        const testConfig = this.state.testConfig;
        return testConfig && testConfig.connectorConfigs && testConfig.connectorConfigs.length > 0;
    }

    getConnectorConfigWarning() {
        let warning = null;
        const testConfig = this.state.testConfig;
        if (this.isTestConfigValid() && testConfig.connectorConfigs.length === 1) {
            warning = <div className="column_plain center">
                <div className="alert alert-danger alert-dismissible show" style={{width: "50%"}} role="alert">
                    <strong>Warning!</strong> To completely test the JavaScript SDK you should be running with one
                    Network and one Cloud connector configuration!
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            </div>
        }
        return warning;
    }

    noTestConfigError() {
        let noTestConfig = null;
        if (!this.isTestConfigValid()) {
            noTestConfig = <Popup
                message="testConfig.json is required.  Please create a testConfig file and place it in integration-test/public.  Please see exampleTestConfig.json for an example."
                closeCallback={() => {
                }}/>
        }
        return noTestConfig;
    }

    getUiBody() {
        let uiBody = null;
        if (this.isTestConfigValid()) {
            let savedTests = JSON.parse(window.localStorage.getItem(this.constants.localStorageSelectedTests));
            let menuItems = [];
            if (savedTests) {
                lodash.forEach(savedTests, (value, key) => {
                    menuItems.push(<MenuItem key={key} onSelect={() => {
                        this.loadTestsIntoSelect2(value)
                    }}>{key}</MenuItem>);
                });
            }
            let closeCallback = () => {
                this.state.pairingCodeMsg = undefined;
            };
            uiBody = <div>
                <br/>
                <div className="column_plain center">
                    <img className="clover_logo" src={"images/clover_logo.png"}/>
                </div>
                <br/>
                <br/>
                {this.state.pairingCodeMsg &&
                <Popup message={this.state.pairingCodeMsg} closeCallback={closeCallback}/>}
                <Modal show={this.state.displayModal} onHide={this.toggleModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Save Seleted Tests</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Test Name: <input ref="testName" type={"text"}></input>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="primary" onClick={this.saveSelect2Selection}>Save</Button>
                        <Button onClick={this.toggleModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
                <div className="column_plain center">
                    <span>Select/Deselect all tests: <input type="checkbox" onChange={this.toggleSelections}/></span>
                </div>
                <div className="column_plain center">
                    <div>
                        <Select2
                            style={{width: '400px'}}
                            id="testCaseSelect"
                            ref="allTestCasesSelect2"
                            multiple
                            onChange={this.onRunTestChange}
                            data={this.state.testCases}
                            value={this.selectedTestCasesToRun}
                            options={
                                {
                                    placeholder: 'Search by name',
                                    closeOnSelect: false
                                }
                            }
                        />
                        <ButtonGroup style={{position: "absolute"}}>
                            <Button bsStyle="primary" className={"btn-margin"} onClick={this.runTests}>Execute</Button>
                        </ButtonGroup>
                    </div>
                </div>
                <br/><br/>
                <div className="column_plain center">
                    <ButtonGroup style={{position: "absolute"}}>
                        <Button bsStyle="default" className={"btn-margin"} onClick={this.toggleModal}>Save selected
                            tests as suite</Button>
                        <DropdownButton title="Load suite" id="bg-nested-dropdown">
                            {menuItems}
                        </DropdownButton>
                    </ButtonGroup>
                </div>
                <br/><br/>
                <div className="column_plain center">
                    <Button bsStyle="default" className={"btn-margin"}
                            onClick={this.toggleTestConnectors}>{this.state.displayConnectorConfig ? "Hide Connector Config" : "View Test Connector Configs"}</Button>
                    {this.state.displayConnectorConfig && <textarea rows="15" cols="80"
                                                                    defaultValue={JSON.stringify(this.state.testConfig, undefined, 4)}></textarea>}
                </div>
                <br/>
                <br/>
                <ResultsGrid rowData={this.state.results}/>
            </div>
        }
        return uiBody;
    }

    render() {
        return (
            <div>
                {this.noTestConfigError()}
                {this.getConnectorConfigWarning()}
                {this.getUiBody()}
            </div>
        );

    }
}