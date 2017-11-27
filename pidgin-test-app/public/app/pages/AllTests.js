import React from 'react';
import lstrNester from '../../test-engine/CloverConnectorLstrNester'


export default class IndexPage extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        //lstrNester.loadAndRunTests();
        return (
            <div>
                <ul>
                    All Tests
                </ul>
            </div>
        );
    }
}