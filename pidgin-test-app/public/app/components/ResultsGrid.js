import React, {Component} from "react";

import {AgGridReact} from "ag-grid-react";

export default class ResultsGrid extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gridOptions: {
                context: {
                    componentParent: this
                }
            },
            columnDefs: ResultsGrid.createColumnDefs(),
            getNodeChildDetails: function getNodeChildDetails(rowItem) {
                if (rowItem.testActions) {
                    if (rowItem.testActions.before) {
                        rowItem.testActions = rowItem.testActions.concat(rowItem.testActions.before);
                    }
                    return {
                        group: true,
                        expanded: true,
                        children: rowItem.testActions,
                        key: rowItem.name
                    };
                } else if (rowItem.before) {
                    return {
                        group: true,
                        expanded: true,
                        children: rowItem.before,
                        key: rowItem.name
                    };
                } else {
                    return null;
                }
            }
        };

        this.onGridReady = this.onGridReady.bind(this);
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        this.gridApi.sizeColumnsToFit();
    }

    static createColumnDefs() {
        const getSimpleCellRenderer = function() {
            function SimpleCellRenderer() {};
            SimpleCellRenderer.prototype.init = function(params) {
                if (params.node.parent && params.node.parent.data && params.node.parent.data.before) {
                    this.txt = `${params.value}(before-test)`;
                } else {
                    this.txt = params.value;
                }
            };
            SimpleCellRenderer.prototype.getGui = function() {
                return this.txt;
            };
            return SimpleCellRenderer;
        };

        return [
            {
                headerName: "Name",
                field: "name",
                cellRenderer: "group",
                width: 100,
                cellRendererParams: {
                    padding: 10,
                    innerRenderer: getSimpleCellRenderer()
                }
            },
            {
                headerName: "Pass",
                field: "result.pass",
                width: 60,
                cellStyle: function(params) {
                    if (params.value) {
                        return {color: 'black', backgroundColor: 'green'};
                    } else if (params.value === false) {
                        return {color: 'black', backgroundColor: 'red'};
                    }
                }
            },
            {
                headerName: "Message",
                field: "result.message"
            }
        ];
    }

    render() {
        return (
            <div style={{height: 400, width: "100%"}} className="ag-fresh">
                <AgGridReact
                    // properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.props.rowData}
                    gridOptions={this.state.gridOptions}
                    getNodeChildDetails={this.state.getNodeChildDetails}

                    // events
                    onGridReady={this.onGridReady}>
                </AgGridReact>
            </div>
        );
    }
};