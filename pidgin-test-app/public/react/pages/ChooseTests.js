import React from 'react'
import Rx from 'rxjs'
import Select2 from 'react-select2-wrapper';
import ButtonNormal from '../components/ButtonNormal'
import * as Constants from '../../Constants'
import Popup from "../components/Popup"
import ResultsGrid from "../components/ResultsGrid"


import * as lstrNester from "../../test-engine/CloverConnectorLstrNester";
import * as cloverConnectorTestManager from "../../test-engine/CloverConnectorTestManager";
export {lstrNester}

export default class ChooseTests extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            testCases: ["loading..."],
            results: []
        };

        this.lNester = lstrNester.create();
        this.testCases;

        if (this.props.location.state) {
            this.testConfig = this.props.location.state.testConfig;
        } else {
            // Navigated directly to ChooseTests(F5), pull from localsotrage
            this.testConfig = JSON.parse(window.localStorage.getItem(Constants.create().localStorageConfigKey));
        }
        this.lNester.loadTests(this.testConfig).done((testDefinitionResponse) => {
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

        this.runTests = this.runTests.bind(this);
        this.onSelect2Change = this.onSelect2Change.bind(this);
        this.handleTestNameChange = this.handleTestNameChange.bind(this);
        this.saveSelect2Selection = this.saveSelect2Selection.bind(this);
        this.loadConfig = this.loadConfig.bind(this);

    }

    onSelect2Change() {
        this.selectedTestCasesToRun = this.refs.allTestCasesSelect2.el.val();
    }

    handleTestNameChange (e) {
        this.testConfigName = e.target.value;
    }

    loadConfig() {
        let constants = Constants.create();
        // Get existing config and add to it
        let existingTestConfigs = window.localStorage.getItem(constants.localStorageSelectedTests);
        if (existingTestConfigs) {
            this.refs.allTestCasesSelect2.el.val(JSON.parse(existingTestConfigs)).trigger('change');
        }
    }

    saveSelect2Selection() {
        let constants = Constants.create();
        window.localStorage.setItem(constants.localStorageSelectedTests, JSON.stringify(this.selectedTestCasesToRun));
    }

    runTests() {
        this.selectedTestCasesToRun = this.refs.allTestCasesSelect2.el.val();
        let testCasesToRun = _.map(this.selectedTestCasesToRun, (fileName) => {
            return this.testCases[fileName];
        });
        let testObservable = new Rx.Subject();
        this.setState({
            results: testCasesToRun
        });

        let gridApi = this.refs.resGrid.gridApi;
        testObservable.subscribe(value => {
            this.state.results.push(value);
            this.setState({
                results: this.state.results
            });
            gridApi.refreshCells();
        });

        cloverConnectorTestManager.create().execute(this.testConfig, testCasesToRun, this, testObservable);
        //Remove all... Todo replace existing?
        this.state.results = [];
    }

    render() {

        let closeCallback = () => {
            this.state.pairingCodeMsg = undefined;
        };

        return (
            <div className="column_plain center">
                {this.state.pairingCodeMsg && <Popup message={this.state.pairingCodeMsg} closeCallback={closeCallback}/>}


                <Select2
                    style={{width: '250px'}}
                    ref="allTestCasesSelect2"
                    multiple
                    onChange={this.onSelect2Change}
                    data={this.state.testCases}
                    value={this.selectedTestCasesToRun}
                    options={
                        {
                            placeholder: 'Search by name',
                            closeOnSelect: false
                        }
                    }
                />
                <ButtonNormal style={"display: block"} color="green" title="Run Tests" onClick={this.runTests}/>
                <br/>
                <ButtonNormal color="white" title="Save Selected Tests to Local Storage" onClick={this.saveSelect2Selection} />
                <ButtonNormal color="white" title="Load Test Config from Local Storage" onClick={this.loadConfig}/>
                <br/>
                <br/>
                <ResultsGrid ref="resGrid" rowData={this.state.results}/>
            </div>

        );
    }
}