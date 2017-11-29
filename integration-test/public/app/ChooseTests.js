import React from 'react'
import Select2 from 'react-select2-wrapper';
import * as Constants from '../Constants'
import Popup from "./components/Popup"
import ResultsGrid from "./components/ResultsGrid"

import { LogLevel, Logger } from '../test-engine/util/Logger'
import * as lstrNester from "../test-engine/CloverConnectorLstrNester";
import * as cloverConnectorTestManager from "../test-engine/CloverConnectorTestManager";
export {lstrNester}
import * as EventService from "./EventService"
import {Button, ButtonGroup, DropdownButton, MenuItem, Modal} from "react-bootstrap";

export default class ChooseTests extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            testCases: ["loading..."],
            results: []
        };

        this.constants = Constants.create();

        jQuery.ajax({
            type: "GET",
            url: "../testConfig.json",
            error: (xhr, status, message) => {
                Logger.log(LogLevel.ERROR, `Failure: An error has occurred and the connection configuration could not be loaded: Details ${message}.`);
            }
        }).done(testConfig => {
            this.setState({
                testConfig: testConfig
            });
            this.state.onlyOneConnectorConfig = this.state.testConfig.connectorConfigs.length === 1 ? true : false;
            this.loadTests();
        });

        this.savedTests = JSON.parse(window.localStorage.getItem(this.constants.localStorageSelectedTests));

        this.lNester = lstrNester.create();

        EventService.get().pairingObservable.subscribe(msg => {
            this.setState({
                pairingCodeMsg: msg
            });
        });

        this.runTests = this.runTests.bind(this);
        this.onRunTestChange = this.onRunTestChange.bind(this);
        this.toggleTestConnectors = this.toggleTestConnectors.bind(this);
        this.handleTestNameChange = this.handleTestNameChange.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.loadConfig = this.loadConfig.bind(this);
        this.saveSelect2Selection = this.saveSelect2Selection.bind(this);
        this.loadTestsIntoSelect2 = this.loadTestsIntoSelect2.bind(this);
    }

    loadTests() {
        this.lNester.loadTests(this.state.testConfig).done((testDefinitionResponse) => {
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
        this.selectedTestCasesToRun = this.refs.allTestCasesSelect2.el.val();

        let testCasesToRun = _.map(this.selectedTestCasesToRun, (fileName) => {
            return this.testCases[fileName];
        });

        this.setState({
            results: testCasesToRun
        });
    }

    toggleTestConnectors() {
        this.setState({
            displayConnectorConfig: !this.state.displayConnectorConfig
        });
    }

    handleTestNameChange (e) {
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
        let testCasesToRun = _.map(this.selectedTestCasesToRun, (fileName) => {
            return this.testCases[fileName];
        });

        let gridApi = this.refs.resGrid.gridApi;
        EventService.get().testObservable.subscribe(value => {
            this.state.results.push(value);
            this.setState({
                results: this.state.results
            });
            gridApi.refreshCells();
        });

        cloverConnectorTestManager.create().execute(this.state.testConfig, testCasesToRun);
    }

    render() {
        let closeCallback = () => {
            this.state.pairingCodeMsg = undefined;
        };

        let savedTests = JSON.parse(window.localStorage.getItem(this.constants.localStorageSelectedTests));
        let menuItems = [];
        if (savedTests) {
            lodash.forEach(savedTests, (value, key) => {
                menuItems.push(<MenuItem key={key} onSelect={() => {this.loadTestsIntoSelect2(value)}}>{key}</MenuItem>);
            });
        }

        return (
            <div>
                {this.state.onlyOneConnectorConfig &&
                <div className="column_plain center">
                    <div className="alert alert-danger alert-dismissible show" style={{width: "50%"}} role="alert">
                        <strong>Warning!</strong> You should really be running with one Network and one Cloud connector!
                        <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </div>}

                <br/>
                <div className="column_plain center">
                    <img className="clover_logo" src={"images/clover_logo.png"}/>
                </div>
                <br/>
                <br/>
                {this.state.pairingCodeMsg && <Popup message={this.state.pairingCodeMsg} closeCallback={closeCallback}/>}

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
                    <div>
                        <Select2
                            style={{width: '400px'}}
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
                            <Button bsStyle="primary" className={"btn-margin"} onClick={this.runTests}>Run Tests</Button>
                            <Button bsStyle="default" className={"btn-margin"} onClick={this.toggleModal}>Save Tests</Button>
                            <DropdownButton title="Load Test Set" id="bg-nested-dropdown">
                                {menuItems}
                            </DropdownButton>
                        </ButtonGroup>
                    </div>
                </div>
                <br/>
                <div className="column_plain center">
                    <Button bsStyle="default" className={"btn-margin"} onClick={this.toggleTestConnectors}>{this.state.displayConnectorConfig ? "Hide Connector Config" : "View Test Connector Configs"}</Button>
                    {this.state.displayConnectorConfig && <textarea rows="15" cols="80" defaultValue={JSON.stringify(this.state.testConfig, undefined, 4)}></textarea>}
                </div>
                <br/>
                <br/>
                <ResultsGrid ref="resGrid" rowData={this.state.results}/>
            </div>

        );
    }
}