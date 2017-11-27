import React from 'react';
import { Redirect } from 'react-router-dom'

import { LogLevel, Logger } from '../../test-engine/util/Logger'
import * as Constants from '../../Constants'
import ButtonNormal from '../components/ButtonNormal'


export default class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            testConfig: null,
            loadedLocalStorage: false,
            uriText: "ws://10.249.255.27:12"
        };

        this.state.testConfig = JSON.parse(window.localStorage.getItem(Constants.create().localStorageConfigKey));
        if (this.state.testConfig) {
            let uriFromLocal = this.getUriTextFromConfig(this.state.testConfig);
            Logger.log(LogLevel.INFO, `Loaded config from local storage, navigate to "/home" to reset what is in localStorage.`);
            Logger.log(LogLevel.INFO, `Using ${uriFromLocal}`);
            this.state.loadedLocalStorage = true;
            this.state.uriText = uriFromLocal;
            // route to choose tests screen... then call this.nestAndTest(true);

        } else {
            jQuery.ajax({
                type: "GET",
                url: "../testConfig.json",
                error: (xhr, status, message) => {
                    Logger.log(LogLevel.ERROR, `Failure: An error has occurred and the connection configuration could not be loaded: Details ${message}.`);
                }
            }).done(testConfig => {
                this.setState({
                    testConfig: testConfig,
                    uriText: this.getUriTextFromConfig(testConfig)
                });
            });
        }

        this.saveConfigAndNavigate = this.saveConfigAndNavigate.bind(this);
        this.handleChange = this.handleChange.bind(this);

    }

    getUriTextFromConfig (jsonConfig) {
        return `${jsonConfig.connectorConfigs[0].wsScheme}://${jsonConfig.connectorConfigs[0].ipAddress}:${jsonConfig.connectorConfigs[0].wsPort}`;
    }

    handleChange (e) {      // handles network pay display uri text
        this.setState({ uriText: e.target.value });
    }

    saveConfigAndNavigate (e) {
        window.localStorage.setItem(Constants.create().localStorageConfigKey, JSON.stringify(this.state.testConfig));
        window.location = e.target.id;
    }

    render() {
        let loadedLocalConfig = this.state.loadedLocalStorage;
        let testConfig = this.state.testConfig;
        let element;

        if (loadedLocalConfig && window.location.href.indexOf('/home') === -1) {
            //Redirect to to choose tests
            element = <Redirect to={{pathname: "/ChooseTests", state:{testConfig: testConfig}}} push={true} />;
        } else {
            element = (<div className="column_plain center">
                <h3>Enter the URI of your device</h3>
                <p> This can be found in the Network Pay Display app</p>
                <div className="connect_box">
                    <input className="input_field" type="text" id="uri" value={this.state.uriText} onChange={this.handleChange}/>
                </div>
                <br/>
                <div>
                    <ButtonNormal color="white" id={"AllTests"} title="Save to local storage and Run All" extra="connect_button" onClick={this.saveConfigAndNavigate}/>
                    <ButtonNormal color="white" id={"ChooseTests"} title="Save to local storage and Choose Tests" extra="connect_button" onClick={this.saveConfigAndNavigate}/>
                </div>
            </div>);
        }

        return element;
    }
}